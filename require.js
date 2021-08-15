// external libraries

// global._ = require('lodash');
global.async = require('async');
// global.bodyparser = require('body-parser');
// global.dateparse = require('dayjs/plugin/customParseFormat');
global.dayjs = require('dayjs');
global.express = require('express');
// global.fetch = require('node-fetch');
// global.fs = require('fs');
global.googlespreadsheet = require('google-spreadsheet');
// global.leapyear = require('dayjs/plugin/isLeapYear');
// global.md5 = require('md5');
// global.mongodb = require('mongodb');
global.notify = require('notify');
// global.schedule = require('node-schedule');
// global.os = require('os');
// global.shajs = require('sha.js');
// global.telegraf = require('telegraf');
// global.striptags = require('striptags');
global.tools = require('tools');
// global.util = require('util');
// global.validator = require('validator');

// global.dayjs.extend(global.dateparse);
// global.dayjs.extend(global.leapyear);

// project modules
global.config = require('./config');
global.routes = require('./routes');
global.google = require('./google');
global.logic = require('./logic');
