interface StaticAssetsBinding {
  fetch(request: Request): Promise<Response>
}

interface WorkerEnvironment {
  ASSETS: StaticAssetsBinding
}

export default {
  fetch(request: Request, environment: WorkerEnvironment): Promise<Response> {
    return environment.ASSETS.fetch(request)
  },
}
