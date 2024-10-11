import cron from 'node-cron'
import { Worker } from 'worker_threads'

class CronManager {
  private jobs: { [key: string]: cron.ScheduledTask }

  constructor() {
    this.jobs = {}
  }

  public addJob(name: string, schedule: string, taskPath: string): void {
    if (this.jobs[name]) {
      console.warn(
        `Cron job '${name}' is already defined and will not be added again.`,
      )
      return
    }

    const job = cron.schedule(
      schedule,
      () => {
        console.log(`Cron job '${name}' is running.`)
        const worker = new Worker(taskPath)

        worker.on('message', (message: string | object) => {
          console.log(`Cron job '${name}' message:`, message)
        })

        worker.on('error', (error: Error) => {
          console.error(`Error in worker for job '${name}':`, error)
        })

        worker.on('exit', (code: number) => {
          if (code !== 0) {
            console.error(
              `Worker for job '${name}' stopped with exit code ${code}`,
            )
          }
        })
      },
      { scheduled: false },
    )

    this.jobs[name] = job
  }

  public startJob(name: string): void {
    if (this.jobs[name]) {
      this.jobs[name].start()
      console.log(`Cron job '${name}' started.`)
    } else {
      console.error(`Cron job '${name}' not found.`)
    }
  }

  public stopJob(name: string): void {
    if (this.jobs[name]) {
      this.jobs[name].stop()
      console.log(`Cron job '${name}' stopped.`)
    } else {
      console.error(`Cron job '${name}' not found.`)
    }
  }
}

export default new CronManager()
