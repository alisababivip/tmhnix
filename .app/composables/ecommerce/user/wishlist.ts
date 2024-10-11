export default function useUserWishlist() {
  const apiPath = useRuntimeConfig().public.apiPath

  // Function to get the user's wishlist
  const getWishlist = async () => {
    return await $fetch(`${apiPath}/api/ecommerce/wishlist`, {
      credentials: 'include',
    })
  }

  // Function to add a product to the user's wishlist
  const addToWishlist = async (productId: number) => {
    return await $fetch(`${apiPath}/api/ecommerce/wishlist/add`, {
      method: 'POST',
      body: { product_id: productId },
      credentials: 'include',
    })
  }

  // Function to remove a product from the user's wishlist
  const removeFromWishlist = async (productId: number) => {
    return await $fetch(
      `${apiPath}/api/ecommerce/wishlist/remove/${productId}`,
      {
        method: 'DELETE',
        credentials: 'include',
      },
    )
  }

  return {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
  }
}
