if (process.env.NODE_ENV === 'development') {
  require('async-bugs');
}

const chalk = require('chalk');
const minimist = require('minimist');

const packageJson = require('./package.json');
const args = minimist(process.argv);

function showHelp () {
  console.log(`
  ${chalk.green(chalk.bold('📦 Bitabase'))}-${chalk.green('Manager')} ${chalk.green(`- v${packageJson.version}`)}
The scalable, sharded database engine.
https://docs.bitabase.com

The following commands and arguments are available when starting Bitabase

Commands:
  start                                    Start the bitabase manager stack
    --advertise-host               Hostname to advertise to others (default: --bind-host)
    --bind-host                            Hostname to bind server to (default: 0.0.0.0)
    --bind-port                            Port to bind server to (default: 8001)
    --rqlite-addr                          Path to contact rqlite
    --secret                               The internal request secret
    --allow-cross-origin-domain            Allow a domain to bypass cross origin domain controls
    --password-hash-iterations             The iterations for the password hashing algorithm to use (default: 372791)
  `.trim() + '\n');
}

function main () {
  if (args.help || args._.length === 2) {
    showHelp();
    console.log(chalk.red('No command specified'));
    process.exit(1);
  }

  if (args._[2] === 'start') {
    const createServer = require('./server');

    createServer({
      ...args,
      advertiseHost: args['advertise-host'],
      bindHost: args['bind-host'],
      bindPort: args['bind-port'],
      rqliteAddr: args['rqlite-addr'],
      setCrossDomainOriginHeaders: args['allow-cross-origin-domain']
        ? (Array.isArray(args['allow-cross-origin-domain']) ? args['allow-cross-origin-domain'] : [args['allow-cross-origin-domain']])
        : [],
      secret: args.secret,
      passwordHashIterations: args['password-hash-iterations']
    });

    return;
  }

  showHelp();
  console.log(args);
  console.log(chalk.red(`Unknown command "${args._[2]}"`));
  process.exit(1);
}

main();
