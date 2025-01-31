local_resource("packages", cmd='npm install', deps=['package.json'])

local_resource("server", serve_cmd="npm run server")

local_resource("client", serve_cmd="npx nx preview", deps=["src", "libs"], links=["http://localhost:4200/"])