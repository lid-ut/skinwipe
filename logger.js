const { createLogger, format, transports } = require('winston');

const { combine, prettyPrint, colorize } = format;

const customTimestamp = format(info => {
  const d = new Date();
  const hr = d.getHours();
  const min = d.getMinutes();
  const sec = d.getSeconds();
  info.message = `[${hr > 9 ? hr : `0${hr}`}:${min > 9 ? min : `0${min}`}:${sec > 9 ? sec : `0${sec}`}] ${info.message}`;
  return info;
})();

const transport = new transports.Console();
const logger = createLogger({
  level: 'info',
  handleExceptions: false,
  format: combine(customTimestamp, colorize(), prettyPrint(), format.splat(), format.simple()),
  transports: [transport],
});

global.logger = logger;
module.exports = logger;
