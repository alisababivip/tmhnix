<?php

namespace App\Http\Controllers;

use App\Models\CoinbaseCurrencies;
use App\Models\GeneralSetting;
use App\Models\KucoinCurrencies;
use App\Models\ThirdpartyProvider;
use App\Models\ThirdpartyTransactions;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletsTransactions;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Throwable;

class WalletController extends Controller
{
    public function __construct()
    {
        if(ThirdpartyProvider::where('status',1)->exists()){
            $thirdparty = ThirdpartyProvider::where('status',1)->first();
            $exchange_class = "\\ccxt\\$thirdparty->title";
            $this->api = new $exchange_class(array(
                'apiKey' => $thirdparty->api,
                'secret' => $thirdparty->secret,
                'password' => $thirdparty->password,
            ));
            $this->provider = $thirdparty->title;
        } else {
            $this->provider = 'funding';
        }
    }

    public function index()
    {
        $page_title = 'Wallets';
        $user = Auth::user();
        if($this->provider != 'funding'){
            if(Wallet::where('provider',$this->provider)->where('user_id', $user->id)->exists()){
                $trading_wallets = Wallet::where('provider',$this->provider)->where('user_id', $user->id)->where('type','trading')->get();
                $funding_wallets = Wallet::where('provider','funding')->where('user_id', $user->id)->where('type','funding')->get();
            } else {
                $trading_wallets = null;
                $funding_wallets = null;
            }
            $api = $this->api;
            if($this->provider == 'coinbasepro'){
                $currencies = CoinbaseCurrencies::where('status',1)->get();
            } else if($this->provider == 'kucoin'){
                $currencies = KucoinCurrencies::where('status',1)->get();
            } else {
                $currencies = null;
            }
            return view('user.wallet.provider', compact('page_title','trading_wallets','funding_wallets','api','currencies'));
        } else {
            if(Wallet::where('type','funding')->where('user_id', $user->id)->exists()){
                $wallets = Wallet::where('type','funding')->where('user_id', $user->id)->get();
            } else {
                $wallets = null;
            }
            return view('user.wallet.index', compact('page_title','wallets'));
        }
    }

    public function wallet($type,$symbol,$address)
    {
        $user = Auth::user();
        $wal = Wallet::where('user_id', $user->id)->where('address',$address)->where('symbol',$symbol)->first();
        $page_title = $wal->symbol.' Wallet';
        $wal_trx = WalletsTransactions::where('user_id', $user->id)->where('symbol', $wal->symbol)->orWhere('to', $wal->symbol)->latest()->paginate(getPaginate(10));
        session()->put('Track', $wal);
        if($this->provider != 'funding'){
            if(Wallet::where('provider',$this->provider)->where('user_id', $user->id)->exists()){
                $trading_wallets = Wallet::where('provider',$this->provider)->where('user_id', $user->id)->where('type','trading')->get();
                $funding_wallets = Wallet::where('provider','funding')->where('user_id', $user->id)->where('type','funding')->get();
            } else {
                $trading_wallets = null;
                $funding_wallets = null;
            }
            $api = $this->api;
            if($this->provider == 'coinbasepro'){
                $currencies = CoinbaseCurrencies::where('status',1)->get();
                $curr = CoinbaseCurrencies::where('symbol', $wal->symbol)->first();
                $cur_link = explode('{{address}}', $curr->crypto_address_link)[0];
                $min = CoinbaseCurrencies::where('symbol',$wal->symbol)->first()->min_withdrawal_amount;
            } else if($this->provider == 'kucoin'){
                $currencies = KucoinCurrencies::where('status',1)->get();
                $curr = KucoinCurrencies::where('symbol', $wal->symbol)->first();
                $min = KucoinCurrencies::where('symbol',$wal->symbol)->first()->min_withdrawal_amount;
                $cur_link = explode('{{address}}', $curr->crypto_address_link)[0];
            } else {
                $currencies = null;
                $curr = null;
            }
            $provider = $this->provider;
            $empty_message = 'No transactions.';
            return view('user.wallet.provider', compact('page_title','empty_message','wal','provider','wal_trx','api','currencies','curr','min','cur_link','type','trading_wallets','funding_wallets'));
        } else {
            if(Wallet::where('type','funding')->where('user_id', $user->id)->exists()){
                $wallets = Wallet::where('user_id', $user->id)->where('type','funding')->get();
            } else {
                $wallets = null;
            }
            return view('user.wallet.index', compact('page_title','wal','wallets','wal_trx','symbol'));
        }
    }
    public function deposit(Request $request)
    {
        $request->validate([
            'address' => 'required|unique:thirdparty_transactions',
        ]);

        $user = Auth::user();
        $deposit = new ThirdpartyTransactions();
        $deposit->user_id = $user->id;
        $deposit->symbol = $request->symbol;
        $deposit->recieving_address = $request->recieving_address;
        $deposit->address = $request->address;
        $deposit->type = '1';
        $deposit->status = '0';
        $deposit->save();

        $wallet_new_trx = new WalletsTransactions();
        $wallet_new_trx->symbol = $request->symbol;
        $wallet_new_trx->user_id = $user->id;
        $wallet_new_trx->address = $request->address;
        $wallet_new_trx->to = $request->recieving_address;
        $wallet_new_trx->type = '1';
        $wallet_new_trx->status = '2';
        $wallet_new_trx->details = 'Deposited To Wallet '.$request->recieving_address;
        $wallet_new_trx->wallet_type = 'trading';
        $wallet_new_trx->save();

        $notify[] = ['success', 'Deposit order placed successfully'];
        return back()->withNotify($notify);;
    }

    public function withdraw(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric',
            'recieving_address' => 'required',
        ]);
        $user = Auth::user();
        $wallet = Wallet::where('user_id',$user->id)->where('provider',$this->provider)->where('type','trading')->where('symbol',$request->symbol)->first();
        $fee = GeneralSetting::where('id',1)->first()->provider_withdraw_fee / 100;
        if(($request->amount * (1 + $fee)) >= $wallet->balance){
            $notify[] = ['warning', 'Your Withdraw Amount is higher than your balance!'];
            return back()->withNotify($notify);
        }

        $withdraw = new ThirdpartyTransactions();
        $withdraw->user_id = $user->id;
        $withdraw->symbol = $request->symbol;
        $withdraw->recieving_address = $request->recieving_address;
        $withdraw->amount = $request->amount;
        if ($this->provider == 'coinbasepro'){
            $provider_withdraw = $this->api->withdraw($request->symbol, $request->amount, $request->recieving_address);
            $withdraw->fee = $provider_withdraw['info']['fee'];
            $withdraw->trx_id = $provider_withdraw['info']['id'];
        } else {
            $this->api->transfer($request->symbol, $request->amount, 'trading', 'main');
            $provider_withdraw = $this->api->withdraw($request->symbol, $request->amount, $request->recieving_address);
            $withdraw->trx_id = $provider_withdraw['info']['data']['withdrawalId'];
            $withdraw->fee = $request->amount * $fee;
        }
        $withdraw->type = '2';
        $withdraw->status = '0';
        $withdraw->save();

        if($withdraw->save()){
            $wallet->balance -= $request->amount + ($request->amount * $fee);
            $wallet->save();

            if ($wallet->save()) {
                $transaction = new Transaction();
                $transaction->user_id = $withdraw->user_id;
                $transaction->amount = getAmount($withdraw->amount);
                $transaction->post_balance = getAmount($wallet->balance);
                $transaction->charge = getAmount($request->amount + ($request->amount * $fee));
                $transaction->trx_type = '-';
                $transaction->details = 'Withdraw of '.$withdraw->amount.' '.$withdraw->symbol.' From Wallet: '. $withdraw->recieving_address;
                $transaction->trx =  $withdraw->trx_id;
                $transaction->save();

                if($transaction->save()){
                    $wallet_new_trx = new WalletsTransactions();
                    $wallet_new_trx->user_id = $withdraw->user_id;
                    $wallet_new_trx->symbol = $withdraw->symbol;
                    $wallet_new_trx->amount = $withdraw->amount;
                    $wallet_new_trx->amount_recieved = $withdraw->amount - $withdraw->fee;
                    $wallet_new_trx->charge = getAmount($request->amount + ($request->amount * $fee));
                    $wallet_new_trx->to = $withdraw->recieving_address;
                    $wallet_new_trx->type = '2';
                    $wallet_new_trx->status = '1';
                    $wallet_new_trx->trx = $withdraw->trx_id;
                    $wallet_new_trx->wallet_type = 'trading';
                    $wallet_new_trx->details = 'Withdraw of '.$withdraw->amount.' '.$withdraw->symbol.' From Wallet: '. $withdraw->recieving_address;
                    $wallet_new_trx->save();
                }
            }
        }

        $notify[] = ['success', 'Withdraw order placed successfully'];
        return back()->withNotify($notify);;
    }

    public function transfer_from_trading(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric',
        ]);

        $user = Auth::user();

        if(Wallet::where('user_id',$user->id)->where('provider','funding')->where('symbol',$request->symbol)->exists() == true){
            $from = Wallet::where('user_id',$user->id)->where('provider',$this->provider)->where('symbol',$request->symbol)->first();
            $to = Wallet::where('user_id',$user->id)->where('provider','funding')->where('symbol',$request->symbol)->first();
            if($request->amount > $from->balance){
                $notify[] = ['warning', 'Amount is higher than your wallet balance'];
            } else {
                $transfer = new Transaction();
                $transfer->user_id = $user->id;
                $transfer->amount = getAmount($request->amount);
                $transfer->post_balance = getAmount($request->balance);
                $transfer->charge = getAmount($request->amount);
                $transfer->trx_type = '-';
                $transfer->details = 'Transfer of '.$request->amount.' '.$request->symbol.' from trading to funding wallet';
                $transfer->trx = getTrx();
                $transfer->save();

                $wallet_new_trx = new WalletsTransactions();
                $wallet_new_trx->user_id = $transfer->user_id;
                $wallet_new_trx->symbol = $request->symbol;
                $wallet_new_trx->amount = $transfer->amount;
                $wallet_new_trx->amount_recieved = $transfer->amount;
                $wallet_new_trx->charge = $request->amount;
                $wallet_new_trx->to = $to->address;
                $wallet_new_trx->type = '3';
                $wallet_new_trx->status = '1';
                $wallet_new_trx->trx = $transfer->trx;
                $wallet_new_trx->wallet_type = 'trading';
                $wallet_new_trx->details = 'Transfer of '.$request->amount.' '.$request->symbol.' from trading to funding wallet';
                $wallet_new_trx->save();

                $from->balance -= $request->amount;
                $from->save();
                $to->balance += $request->amount;
                $to->save();

                $notify[] = ['success', 'Balance Transferred Successfully'];
            }
        } else {
            $notify[] = ['warning', 'Create Funding Wallet first'];
        }
        return back()->withNotify($notify);
    }

    public function transfer_from_funding(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric',
        ]);

        $user = Auth::user();
        if(Wallet::where('user_id',$user->id)->where('provider',$this->provider)->where('symbol',$request->symbol)->exists() == true){
            $from = Wallet::where('user_id',$user->id)->where('provider','funding')->where('symbol',$request->symbol)->first();
            $to = Wallet::where('user_id',$user->id)->where('provider',$this->provider)->where('symbol',$request->symbol)->first();
            if($request->amount > $from->balance){
                $notify[] = ['warning', 'Amount is higher than your wallet balance'];
            } else {
                $transfer = new Transaction();
                $transfer->user_id = $user->id;
                $transfer->amount = getAmount($request->amount);
                $transfer->post_balance = getAmount($request->balance);
                $transfer->charge = getAmount($request->amount);
                $transfer->trx_type = '-';
                $transfer->details = 'Transfer of '.$request->amount.' '.$request->symbol.' from funding to trading wallet';
                $transfer->trx = getTrx();
                $transfer->save();
                $from->balance -= $request->amount;
                $from->save();

                $wallet_new_trx = new WalletsTransactions();
                $wallet_new_trx->user_id = $transfer->user_id;
                $wallet_new_trx->symbol = $request->symbol;
                $wallet_new_trx->amount = $transfer->amount;
                $wallet_new_trx->amount_recieved = $transfer->amount;
                $wallet_new_trx->charge = $request->amount;
                $wallet_new_trx->to = $to->address;
                $wallet_new_trx->type = '4';
                $wallet_new_trx->status = '2';
                $wallet_new_trx->trx = $transfer->trx;
                $wallet_new_trx->wallet_type = 'funding';
                $wallet_new_trx->details = 'Transfer of '.$request->amount.' '.$request->symbol.' from funding to trading wallet';
                $wallet_new_trx->save();

                $notify[] = ['success', 'Balance Transfer Pending'];
            }
        } else {
            $notify[] = ['warning', 'Create Trading Wallet first'];
        }
        return back()->withNotify($notify);
    }

    public function trx($trx)
    {
        $page_title = 'Wallets';
        $wal = WalletsTransactions::where('trx',$trx)->first();
        $wallet = Wallet::where('address',$wal->address)->first();
        $wal_to = Wallet::where('address',$wal->to)->first();
        $user = User::where('id',$wal->user_id)->first();
        $fee = GeneralSetting::first()->exchange_fee / 100;
        return view('user.transactions.info', compact('page_title','trx','wal','user','wallet','wal_to','fee'));
    }

    public function invoice_print($trx)
    {
        $page_title = 'Print';
        $wal=WalletsTransactions::where('trx',$trx)->first();
        $wallet = Wallet::where('address',$wal->address)->first();
        $wal_to = Wallet::where('address',$wal->to)->first();
        $user = User::where('id',$wal->user_id)->first();
        $fee = GeneralSetting::first()->exchange_fee / 100;
        return view('user.transactions.print', compact('page_title','trx','wal','user','wallet','wal_to','fee'));
    }

    public function send(Request $request)
    {
        $fee = GeneralSetting::first()->trx_fee / 100;
        if(Wallet::where('address',$request->from)->exists()){
            $sender_wallet = Wallet::where('address',$request->from)->first();
            $sender = User::where('id', $sender_wallet->user_id)->first();
            if(Wallet::where('address',$request->to)->exists()){
                $reciever_wallet = Wallet::where('address',$request->to)->first();
                if($sender_wallet->balance > $request->amount){
                    $wallet_new_trx = new WalletsTransactions();
                    $wallet_new_trx->user_id = $sender->id;
                    $wallet_new_trx->address = $sender_wallet->address;
                    $wallet_new_trx->amount = $request->amount;
                    $wallet_new_trx->amount_recieved = (getCoinRate($sender_wallet->symbol) / getCoinRate($reciever_wallet->symbol)) * $request->amount;
                    $wallet_new_trx->charge = $request->amount * $fee;
                    $wallet_new_trx->to = $reciever_wallet->address;
                    $wallet_new_trx->type = '3';
                    $wallet_new_trx->status = '1';
                    $wallet_new_trx->trx = grs(16);
                    $wallet_new_trx->details = $request->details;
                    $wallet_new_trx->save();

                    $sender_wallet->balance -= $request->amount + ($request->amount * $fee);
                    $sender_wallet->save();

                    $reciever_wallet->balance += (getCoinRate($sender_wallet->symbol) / getCoinRate($reciever_wallet->symbol)) * $request->amount;
                    $reciever_wallet->save();

                    $notify[] = ['success', 'Wallat Transaction Excuted Successfully'];
                    return back()->withNotify($notify);
                } else {
                    $notify[] = ['warning', 'You Dont Have Enought Balance!'];
                    return back()->withNotify($notify);
                }
            } else {
                $notify[] = ['warning', 'Reciever Wallet Not Found'];
                return back()->withNotify($notify);
            }
        } else {
            $notify[] = ['warning', 'Transaction Failed'];
            return back()->withNotify($notify);
        }
    }

    public function request(Request $request)
    {
        $fee = GeneralSetting::first()->trx_fee / 100;
        if(Wallet::where('address',$request->from)->exists()){
            $sender_wallet = Wallet::where('address',$request->from)->first();
            $sender = User::where('id', $sender_wallet->user_id)->first();
            if(Wallet::where('address',$request->to)->exists()){
                $reciever_wallet = Wallet::where('address',$request->to)->first();
                    $wallet_new_trx = new WalletsTransactions();
                    $wallet_new_trx->user_id = $sender->id;
                    $wallet_new_trx->address = $sender_wallet->address;
                    $wallet_new_trx->amount = $request->amount;
                    $wallet_new_trx->to = $reciever_wallet->address;
                    $wallet_new_trx->type = '4';
                    $wallet_new_trx->status = '2';
                    $wallet_new_trx->trx = grs(16);
                    $wallet_new_trx->details = $request->details;
                    $wallet_new_trx->save();

                    $notify[] = ['success', 'Request Sent Successfully'];
                    return back()->withNotify($notify);
            } else {
                $notify[] = ['warning', 'Reciever Wallet Not Found'];
                return back()->withNotify($notify);
            }
        } else {
            $notify[] = ['warning', 'Transaction Failed'];
            return back()->withNotify($notify);
        }
    }
    public function accept($trx)
    {
        $fee = GeneralSetting::first()->trx_fee / 100;
        $wal_trx = WalletsTransactions::where('trx',$trx)->firstOrFail();
        $wal_sender = Wallet::where('address',$wal_trx->to)->firstOrFail();
        $wal_requester = Wallet::where('address',$wal_trx->address)->firstOrFail();

        if (($wal_trx->amount + ($wal_trx->amount * $fee)) < $wal_sender->balance) {
            $wal_trx->status = 1;
            $wal_trx->save();
            if($wal_trx->save()){
                $wal_trx->status = '1';
                $wal_trx->amount_recieved = $wal_trx->amount;
                $wal_trx->charge = $wal_trx->amount * $fee;
                $wal_trx->details = 'Request Is Approved';
                $wal_trx->save();
                if($wal_trx->save()){
                    $wal_sender->balance -= ($wal_trx->amount + ($wal_trx->amount * $fee)) / getCoinRate($wal_sender->symbol);
                    $wal_sender->save();
                    if($wal_sender->save()){
                        $wal_requester->balance += $wal_trx->amount;
                        $wal_requester->save();
                        $notify[] = ['success', 'Request Approved Successfully'];
                    }
                }
            }
        } else {
            $notify[] = ['warning', 'You Dont Have Adequate Balance'];
        }
        return back()->withNotify($notify);
    }

    public function reject($trx)
    {
        $wal_trx = WalletsTransactions::where('trx',$trx)->firstOrFail();
        $wal_trx->status = 3;
        $wal_trx->save();

        $notify[] = ['success', 'Request Rejected Successfully'];
        return back()->withNotify($notify);

    }

    public function authenticate(Request $request)
    {
        $user = User::where('eth_address', $request->ethAddress)->firstOrFail();

        auth()->login($user);

        return true;
    }

    public function connect(Request $request)
    {
        $user = Auth::user();
        $user->forceFill([
            'eth_Address'=> $request->ethAddress,
        ])->save();
        return 1;
    }

    public function disconnect(Request $request)
    {
        $user = Auth::user();
        $user->forceFill([
            'eth_Address'=> null,
        ])->save();
        return 1;
    }

    public function create(Request $request) {
        $user = Auth::user();
        if($request->symbol == null){
            $notify[] = ['warning', 'Select wallet type!'];
        } else {
            if(Wallet::where('provider',$this->provider)->where('user_id', $user->id)->where('type',$request->type)->where('symbol', $request->symbol)->first()){
                $notify[] = ['warning', 'You Have ' . $request->symbol .' Wallet Already!'];
            } else {
                if($request->type == 'trading'){
                    $wallet = new Wallet();
                    $wallet->user_id = $user->id;
                    $wallet->provider = $this->provider;
                    $wallet->symbol = $request->symbol;
                    $wallet->type = 'trading';
                    if ($this->provider == 'coinbasepro'){
                        try {
                            $wallet->address = $this->api->create_deposit_address($request->symbol)['address'];
                            $wallet->chain = 'ERC20';
                            $notify[] = ['success', 'Your ' . $wallet->symbol .' Wallet Created Successfully'];
                        } catch (Throwable $e) {
                            $notify[] = ['warning', 'Wallet Generation Failed, Please report to support'];
                        }
                    } else if ($this->provider == 'kucoin'){
                        try {
                            try{
                                $add = $this->api->createDepositAddress($request->symbol);
                            } catch (Throwable $e) {
                                $add = $this->api->fetchDepositAddress($request->symbol);
                            }
                            $wallet->address = $add['address'];
                            $wallet->chain = $add['info']['data']['chain'];
                            $notify[] = ['success', 'Your '. $wallet->symbol .' Wallet Created Successfully'];
                        } catch (Throwable $e) {
                            $notify[] = ['warning', 'Wallet Generation Failed, Please report to support'];
                        }
                    }
                    $wallet->save();
                } else {
                    if(Wallet::where('provider','funding')->where('user_id', $user->id)->where('type',$request->type)->where('symbol', $request->symbol)->first()){
                        $notify[] = ['warning', 'You Have ' . $request->symbol .' Wallet Already!'];
                    } else {
                        $wallet = new Wallet();
                        $wallet->user_id = $user->id;
                        $wallet->symbol = $request->symbol;
                        $wallet->address = grs(34);
                        $wallet->type = 'funding';
                        $wallet->provider = 'funding';
                        $notify[] = ['success', 'Your ' . $wallet->symbol .' Wallet Created Successfully'];
                        $wallet->save();
                    }
                }
            }
        }
        return back()->withNotify($notify);
    }

    public function admincreateWallet(Request $request) {
        if(Wallet::where('provider',$this->provider)->where('user_id', $request->user_id)->where('type',$request->type)->where('symbol', $request->symbol)->first()){
            $notify[] = ['warning', 'You Have ' . $request->symbol .' Wallet Already!'];
        } else {
            if($request->type == 'trading'){
                $wallet = new Wallet();
                $wallet->user_id = $request->user_id;
                $wallet->provider = $this->provider;
                $wallet->symbol = $request->symbol;
                $wallet->type = 'trading';
                if ($this->provider == 'coinbasepro'){
                    try {
                        $wallet->address = $this->api->create_deposit_address($request->symbol)['address'];
                        $wallet->chain = 'ERC20';
                        $notify[] = ['success', 'Your ' . $wallet->symbol .' Wallet Created Successfully'];
                    } catch (Throwable $e) {
                        $notify[] = ['warning', 'Wallet Generation Failed'];
                    }
                } else if ($this->provider == 'kucoin'){
                    try {
                        try{
                            $add = $this->api->createDepositAddress($request->symbol);
                        } catch (Throwable $e) {
                            $add = $this->api->fetchDepositAddress($request->symbol);
                        }
                        $wallet->address = $add['address'];
                        $wallet->chain = $add['info']['data']['chain'];
                        $notify[] = ['success', 'Client '. $wallet->symbol .' Wallet Created Successfully'];
                    } catch (Throwable $e) {
                        $notify[] = ['warning', 'Wallet Generation Failed'];
                    }
                }
                $wallet->save();
            } else {
                if(Wallet::where('provider','funding')->where('user_id', $request->user_id)->where('type',$request->type)->where('symbol', $request->symbol)->first()){
                    $notify[] = ['warning', 'You Have ' . $request->symbol .' Wallet Already!'];
                } else {
                    $wallet = new Wallet();
                    $wallet->user_id = $request->user_id;
                    $wallet->symbol = $request->symbol;
                    $wallet->address = grs(34);
                    $wallet->type = 'funding';
                    $wallet->provider = 'funding';
                    $notify[] = ['success', 'Client ' . $wallet->symbol .' Wallet Created Successfully'];
                    $wallet->save();
                }
            }
        }
        return back()->withNotify($notify);
    }

    public function adminregenerateWallet(Request $request) {
        $wallet = Wallet::where('user_id',$request->user_id)->where('address',$request->address)->first();
        if($request->type == 'trading'){
            $wallet->provider = $this->provider;
            if ($this->provider == 'coinbasepro'){
                try {
                    $wallet->address = $this->api->create_deposit_address($wallet->symbol)['address'];
                    $wallet->chain = 'ERC20';
                    $notify[] = ['success', 'Your ' . $wallet->symbol .' Wallet Regenerated Successfully'];
                } catch (Throwable $e) {
                    $notify[] = ['warning', 'Wallet Generation Failed'];
                }
            } else if ($this->provider == 'kucoin'){
                try {
                    try{
                        $add = $this->api->createDepositAddress($wallet->symbol);
                    } catch (Throwable $e) {
                        $add = $this->api->fetchDepositAddress($wallet->symbol);
                    }
                    $wallet->address = $add['address'];
                    $wallet->chain = $add['info']['data']['chain'];
                    $notify[] = ['success', 'Client '. $wallet->symbol .' Wallet Regenerated Successfully'];
                } catch (Throwable $e) {
                    $notify[] = ['warning', 'Wallet Generation Failed'];
                }
            }
            $wallet->save();
        } else {
            if(Wallet::where('provider','funding')->where('user_id', $request->user_id)->where('type',$request->type)->where('symbol', $request->symbol)->first()){
                $notify[] = ['warning', 'You Have ' . $request->symbol .' Wallet Already!'];
            } else {
                $wallet->address = grs(34);
                $wallet->type = 'funding';
                $wallet->provider = 'funding';
                $notify[] = ['success', 'Client ' . $wallet->symbol .' Wallet Regenerated Successfully'];
                $wallet->save();
            }
        }
        return back()->withNotify($notify);
    }

}
