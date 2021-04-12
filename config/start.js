process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

const fs = require('fs');
const paths = require('./paths');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const clearConsole = require('react-dev-utils/clearConsole');
const chalk = require('react-dev-utils/chalk');
const openBrowser = require('react-dev-utils/openBrowser');
const {
  createCompiler,
  prepareProxy,
  prepareUrls,
} = require('react-dev-utils/WebpackDevServerUtils');
const createDevServerConfig = require('./webpackDevServer.config');
const configFactory = require('./webpack.dev');

const isInteractive = process.stdout.isTTY;
const useYarn = fs.existsSync(paths.appYarnLock);
const useTypeScript = false;
const tscCompileOnError = false;
const appPackageJson = require(paths.appPackageJson);

const config = configFactory('development');
const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';

const argv = process.argv.slice(2);

//  Port setup
const portIdx =
  argv.indexOf('--port') !== -1 ? argv.indexOf('--port') : argv.indexOf('-p');
const PORT = process.env.PORT || portIdx !== -1 ? argv[portIdx + 1] : 3000;

const HOST = process.env.HOST || '0.0.0.0';
// const PORT = process.env.PORT || 3000;

const urls = prepareUrls(protocol, HOST, PORT, '');
const devSocket = {
  warnings: (warnings) =>
    devServer.sockWrite(devServer.sockets, 'warnings', warnings),
  errors: (errors) => devServer.sockWrite(devServer.sockets, 'errors', errors),
};

const compiler = createCompiler({
  appName: appPackageJson.name,
  config,
  devSocket,
  urls,
  useYarn,
  useTypeScript,
  tscCompileOnError,
  webpack,
});

const proxySetting = appPackageJson.proxy;
const proxyConfig = prepareProxy(proxySetting, paths.appPublic, '');
// Serve webpack assets generated by the compiler over a web server.
const serverConfig = createDevServerConfig(proxyConfig, urls.lanUrlForConfig);

const devServer = new WebpackDevServer(compiler, serverConfig);
// Launch WebpackDevServer.
devServer.listen(PORT, HOST, (err) => {
  if (err) {
    return console.log(err);
  }
  if (isInteractive) {
    clearConsole();
  }

  console.log(chalk.cyan('Starting the development server...\n'));
  openBrowser(urls.localUrlForBrowser);
});

['SIGINT', 'SIGTERM'].forEach(function (sig) {
  process.on(sig, function () {
    devServer.close();
    process.exit();
  });
});

if (process.env.CI !== 'true') {
  // Gracefully exit when stdin ends
  process.stdin.on('end', function () {
    devServer.close();
    process.exit();
  });
}