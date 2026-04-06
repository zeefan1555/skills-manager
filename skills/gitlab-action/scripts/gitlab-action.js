#!/usr/bin/env node
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../../../../../../../plugins/gitlab/infra/gitlab-action/node_modules/.pnpm/commander@12.1.0/node_modules/commander/lib/error.js
var require_error = __commonJS({
  "../../../../../../../plugins/gitlab/infra/gitlab-action/node_modules/.pnpm/commander@12.1.0/node_modules/commander/lib/error.js"(exports2) {
    var CommanderError2 = class extends Error {
      /**
       * Constructs the CommanderError class
       * @param {number} exitCode suggested exit code which could be used with process.exit
       * @param {string} code an id string representing the error
       * @param {string} message human-readable description of the error
       */
      constructor(exitCode, code, message) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
        this.code = code;
        this.exitCode = exitCode;
        this.nestedError = void 0;
      }
    };
    var InvalidArgumentError2 = class extends CommanderError2 {
      /**
       * Constructs the InvalidArgumentError class
       * @param {string} [message] explanation of why argument is invalid
       */
      constructor(message) {
        super(1, "commander.invalidArgument", message);
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
      }
    };
    exports2.CommanderError = CommanderError2;
    exports2.InvalidArgumentError = InvalidArgumentError2;
  }
});

// ../../../../../../../plugins/gitlab/infra/gitlab-action/node_modules/.pnpm/commander@12.1.0/node_modules/commander/lib/argument.js
var require_argument = __commonJS({
  "../../../../../../../plugins/gitlab/infra/gitlab-action/node_modules/.pnpm/commander@12.1.0/node_modules/commander/lib/argument.js"(exports2) {
    var { InvalidArgumentError: InvalidArgumentError2 } = require_error();
    var Argument2 = class {
      /**
       * Initialize a new command argument with the given name and description.
       * The default is that the argument is required, and you can explicitly
       * indicate this with <> around the name. Put [] around the name for an optional argument.
       *
       * @param {string} name
       * @param {string} [description]
       */
      constructor(name, description) {
        this.description = description || "";
        this.variadic = false;
        this.parseArg = void 0;
        this.defaultValue = void 0;
        this.defaultValueDescription = void 0;
        this.argChoices = void 0;
        switch (name[0]) {
          case "<":
            this.required = true;
            this._name = name.slice(1, -1);
            break;
          case "[":
            this.required = false;
            this._name = name.slice(1, -1);
            break;
          default:
            this.required = true;
            this._name = name;
            break;
        }
        if (this._name.length > 3 && this._name.slice(-3) === "...") {
          this.variadic = true;
          this._name = this._name.slice(0, -3);
        }
      }
      /**
       * Return argument name.
       *
       * @return {string}
       */
      name() {
        return this._name;
      }
      /**
       * @package
       */
      _concatValue(value, previous) {
        if (previous === this.defaultValue || !Array.isArray(previous)) {
          return [value];
        }
        return previous.concat(value);
      }
      /**
       * Set the default value, and optionally supply the description to be displayed in the help.
       *
       * @param {*} value
       * @param {string} [description]
       * @return {Argument}
       */
      default(value, description) {
        this.defaultValue = value;
        this.defaultValueDescription = description;
        return this;
      }
      /**
       * Set the custom handler for processing CLI command arguments into argument values.
       *
       * @param {Function} [fn]
       * @return {Argument}
       */
      argParser(fn) {
        this.parseArg = fn;
        return this;
      }
      /**
       * Only allow argument value to be one of choices.
       *
       * @param {string[]} values
       * @return {Argument}
       */
      choices(values) {
        this.argChoices = values.slice();
        this.parseArg = (arg, previous) => {
          if (!this.argChoices.includes(arg)) {
            throw new InvalidArgumentError2(
              `Allowed choices are ${this.argChoices.join(", ")}.`
            );
          }
          if (this.variadic) {
            return this._concatValue(arg, previous);
          }
          return arg;
        };
        return this;
      }
      /**
       * Make argument required.
       *
       * @returns {Argument}
       */
      argRequired() {
        this.required = true;
        return this;
      }
      /**
       * Make argument optional.
       *
       * @returns {Argument}
       */
      argOptional() {
        this.required = false;
        return this;
      }
    };
    function humanReadableArgName(arg) {
      const nameOutput = arg.name() + (arg.variadic === true ? "..." : "");
      return arg.required ? "<" + nameOutput + ">" : "[" + nameOutput + "]";
    }
    exports2.Argument = Argument2;
    exports2.humanReadableArgName = humanReadableArgName;
  }
});

// ../../../../../../../plugins/gitlab/infra/gitlab-action/node_modules/.pnpm/commander@12.1.0/node_modules/commander/lib/help.js
var require_help = __commonJS({
  "../../../../../../../plugins/gitlab/infra/gitlab-action/node_modules/.pnpm/commander@12.1.0/node_modules/commander/lib/help.js"(exports2) {
    var { humanReadableArgName } = require_argument();
    var Help2 = class {
      constructor() {
        this.helpWidth = void 0;
        this.sortSubcommands = false;
        this.sortOptions = false;
        this.showGlobalOptions = false;
      }
      /**
       * Get an array of the visible subcommands. Includes a placeholder for the implicit help command, if there is one.
       *
       * @param {Command} cmd
       * @returns {Command[]}
       */
      visibleCommands(cmd) {
        const visibleCommands = cmd.commands.filter((cmd2) => !cmd2._hidden);
        const helpCommand = cmd._getHelpCommand();
        if (helpCommand && !helpCommand._hidden) {
          visibleCommands.push(helpCommand);
        }
        if (this.sortSubcommands) {
          visibleCommands.sort((a, b) => {
            return a.name().localeCompare(b.name());
          });
        }
        return visibleCommands;
      }
      /**
       * Compare options for sort.
       *
       * @param {Option} a
       * @param {Option} b
       * @returns {number}
       */
      compareOptions(a, b) {
        const getSortKey = (option) => {
          return option.short ? option.short.replace(/^-/, "") : option.long.replace(/^--/, "");
        };
        return getSortKey(a).localeCompare(getSortKey(b));
      }
      /**
       * Get an array of the visible options. Includes a placeholder for the implicit help option, if there is one.
       *
       * @param {Command} cmd
       * @returns {Option[]}
       */
      visibleOptions(cmd) {
        const visibleOptions = cmd.options.filter((option) => !option.hidden);
        const helpOption = cmd._getHelpOption();
        if (helpOption && !helpOption.hidden) {
          const removeShort = helpOption.short && cmd._findOption(helpOption.short);
          const removeLong = helpOption.long && cmd._findOption(helpOption.long);
          if (!removeShort && !removeLong) {
            visibleOptions.push(helpOption);
          } else if (helpOption.long && !removeLong) {
            visibleOptions.push(
              cmd.createOption(helpOption.long, helpOption.description)
            );
          } else if (helpOption.short && !removeShort) {
            visibleOptions.push(
              cmd.createOption(helpOption.short, helpOption.description)
            );
          }
        }
        if (this.sortOptions) {
          visibleOptions.sort(this.compareOptions);
        }
        return visibleOptions;
      }
      /**
       * Get an array of the visible global options. (Not including help.)
       *
       * @param {Command} cmd
       * @returns {Option[]}
       */
      visibleGlobalOptions(cmd) {
        if (!this.showGlobalOptions)
          return [];
        const globalOptions = [];
        for (let ancestorCmd = cmd.parent; ancestorCmd; ancestorCmd = ancestorCmd.parent) {
          const visibleOptions = ancestorCmd.options.filter(
            (option) => !option.hidden
          );
          globalOptions.push(...visibleOptions);
        }
        if (this.sortOptions) {
          globalOptions.sort(this.compareOptions);
        }
        return globalOptions;
      }
      /**
       * Get an array of the arguments if any have a description.
       *
       * @param {Command} cmd
       * @returns {Argument[]}
       */
      visibleArguments(cmd) {
        if (cmd._argsDescription) {
          cmd.registeredArguments.forEach((argument) => {
            argument.description = argument.description || cmd._argsDescription[argument.name()] || "";
          });
        }
        if (cmd.registeredArguments.find((argument) => argument.description)) {
          return cmd.registeredArguments;
        }
        return [];
      }
      /**
       * Get the command term to show in the list of subcommands.
       *
       * @param {Command} cmd
       * @returns {string}
       */
      subcommandTerm(cmd) {
        const args = cmd.registeredArguments.map((arg) => humanReadableArgName(arg)).join(" ");
        return cmd._name + (cmd._aliases[0] ? "|" + cmd._aliases[0] : "") + (cmd.options.length ? " [options]" : "") + // simplistic check for non-help option
        (args ? " " + args : "");
      }
      /**
       * Get the option term to show in the list of options.
       *
       * @param {Option} option
       * @returns {string}
       */
      optionTerm(option) {
        return option.flags;
      }
      /**
       * Get the argument term to show in the list of arguments.
       *
       * @param {Argument} argument
       * @returns {string}
       */
      argumentTerm(argument) {
        return argument.name();
      }
      /**
       * Get the longest command term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      longestSubcommandTermLength(cmd, helper) {
        return helper.visibleCommands(cmd).reduce((max, command) => {
          return Math.max(max, helper.subcommandTerm(command).length);
        }, 0);
      }
      /**
       * Get the longest option term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      longestOptionTermLength(cmd, helper) {
        return helper.visibleOptions(cmd).reduce((max, option) => {
          return Math.max(max, helper.optionTerm(option).length);
        }, 0);
      }
      /**
       * Get the longest global option term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      longestGlobalOptionTermLength(cmd, helper) {
        return helper.visibleGlobalOptions(cmd).reduce((max, option) => {
          return Math.max(max, helper.optionTerm(option).length);
        }, 0);
      }
      /**
       * Get the longest argument term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      longestArgumentTermLength(cmd, helper) {
        return helper.visibleArguments(cmd).reduce((max, argument) => {
          return Math.max(max, helper.argumentTerm(argument).length);
        }, 0);
      }
      /**
       * Get the command usage to be displayed at the top of the built-in help.
       *
       * @param {Command} cmd
       * @returns {string}
       */
      commandUsage(cmd) {
        let cmdName = cmd._name;
        if (cmd._aliases[0]) {
          cmdName = cmdName + "|" + cmd._aliases[0];
        }
        let ancestorCmdNames = "";
        for (let ancestorCmd = cmd.parent; ancestorCmd; ancestorCmd = ancestorCmd.parent) {
          ancestorCmdNames = ancestorCmd.name() + " " + ancestorCmdNames;
        }
        return ancestorCmdNames + cmdName + " " + cmd.usage();
      }
      /**
       * Get the description for the command.
       *
       * @param {Command} cmd
       * @returns {string}
       */
      commandDescription(cmd) {
        return cmd.description();
      }
      /**
       * Get the subcommand summary to show in the list of subcommands.
       * (Fallback to description for backwards compatibility.)
       *
       * @param {Command} cmd
       * @returns {string}
       */
      subcommandDescription(cmd) {
        return cmd.summary() || cmd.description();
      }
      /**
       * Get the option description to show in the list of options.
       *
       * @param {Option} option
       * @return {string}
       */
      optionDescription(option) {
        const extraInfo = [];
        if (option.argChoices) {
          extraInfo.push(
            // use stringify to match the display of the default value
            `choices: ${option.argChoices.map((choice) => JSON.stringify(choice)).join(", ")}`
          );
        }
        if (option.defaultValue !== void 0) {
          const showDefault = option.required || option.optional || option.isBoolean() && typeof option.defaultValue === "boolean";
          if (showDefault) {
            extraInfo.push(
              `default: ${option.defaultValueDescription || JSON.stringify(option.defaultValue)}`
            );
          }
        }
        if (option.presetArg !== void 0 && option.optional) {
          extraInfo.push(`preset: ${JSON.stringify(option.presetArg)}`);
        }
        if (option.envVar !== void 0) {
          extraInfo.push(`env: ${option.envVar}`);
        }
        if (extraInfo.length > 0) {
          return `${option.description} (${extraInfo.join(", ")})`;
        }
        return option.description;
      }
      /**
       * Get the argument description to show in the list of arguments.
       *
       * @param {Argument} argument
       * @return {string}
       */
      argumentDescription(argument) {
        const extraInfo = [];
        if (argument.argChoices) {
          extraInfo.push(
            // use stringify to match the display of the default value
            `choices: ${argument.argChoices.map((choice) => JSON.stringify(choice)).join(", ")}`
          );
        }
        if (argument.defaultValue !== void 0) {
          extraInfo.push(
            `default: ${argument.defaultValueDescription || JSON.stringify(argument.defaultValue)}`
          );
        }
        if (extraInfo.length > 0) {
          const extraDescripton = `(${extraInfo.join(", ")})`;
          if (argument.description) {
            return `${argument.description} ${extraDescripton}`;
          }
          return extraDescripton;
        }
        return argument.description;
      }
      /**
       * Generate the built-in help text.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {string}
       */
      formatHelp(cmd, helper) {
        const termWidth = helper.padWidth(cmd, helper);
        const helpWidth = helper.helpWidth || 80;
        const itemIndentWidth = 2;
        const itemSeparatorWidth = 2;
        function formatItem(term, description) {
          if (description) {
            const fullText = `${term.padEnd(termWidth + itemSeparatorWidth)}${description}`;
            return helper.wrap(
              fullText,
              helpWidth - itemIndentWidth,
              termWidth + itemSeparatorWidth
            );
          }
          return term;
        }
        function formatList(textArray) {
          return textArray.join("\n").replace(/^/gm, " ".repeat(itemIndentWidth));
        }
        let output = [`Usage: ${helper.commandUsage(cmd)}`, ""];
        const commandDescription = helper.commandDescription(cmd);
        if (commandDescription.length > 0) {
          output = output.concat([
            helper.wrap(commandDescription, helpWidth, 0),
            ""
          ]);
        }
        const argumentList = helper.visibleArguments(cmd).map((argument) => {
          return formatItem(
            helper.argumentTerm(argument),
            helper.argumentDescription(argument)
          );
        });
        if (argumentList.length > 0) {
          output = output.concat(["Arguments:", formatList(argumentList), ""]);
        }
        const optionList = helper.visibleOptions(cmd).map((option) => {
          return formatItem(
            helper.optionTerm(option),
            helper.optionDescription(option)
          );
        });
        if (optionList.length > 0) {
          output = output.concat(["Options:", formatList(optionList), ""]);
        }
        if (this.showGlobalOptions) {
          const globalOptionList = helper.visibleGlobalOptions(cmd).map((option) => {
            return formatItem(
              helper.optionTerm(option),
              helper.optionDescription(option)
            );
          });
          if (globalOptionList.length > 0) {
            output = output.concat([
              "Global Options:",
              formatList(globalOptionList),
              ""
            ]);
          }
        }
        const commandList = helper.visibleCommands(cmd).map((cmd2) => {
          return formatItem(
            helper.subcommandTerm(cmd2),
            helper.subcommandDescription(cmd2)
          );
        });
        if (commandList.length > 0) {
          output = output.concat(["Commands:", formatList(commandList), ""]);
        }
        return output.join("\n");
      }
      /**
       * Calculate the pad width from the maximum term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      padWidth(cmd, helper) {
        return Math.max(
          helper.longestOptionTermLength(cmd, helper),
          helper.longestGlobalOptionTermLength(cmd, helper),
          helper.longestSubcommandTermLength(cmd, helper),
          helper.longestArgumentTermLength(cmd, helper)
        );
      }
      /**
       * Wrap the given string to width characters per line, with lines after the first indented.
       * Do not wrap if insufficient room for wrapping (minColumnWidth), or string is manually formatted.
       *
       * @param {string} str
       * @param {number} width
       * @param {number} indent
       * @param {number} [minColumnWidth=40]
       * @return {string}
       *
       */
      wrap(str, width, indent, minColumnWidth = 40) {
        const indents = " \\f\\t\\v\xA0\u1680\u2000-\u200A\u202F\u205F\u3000\uFEFF";
        const manualIndent = new RegExp(`[\\n][${indents}]+`);
        if (str.match(manualIndent))
          return str;
        const columnWidth = width - indent;
        if (columnWidth < minColumnWidth)
          return str;
        const leadingStr = str.slice(0, indent);
        const columnText = str.slice(indent).replace("\r\n", "\n");
        const indentString = " ".repeat(indent);
        const zeroWidthSpace = "\u200B";
        const breaks = `\\s${zeroWidthSpace}`;
        const regex = new RegExp(
          `
|.{1,${columnWidth - 1}}([${breaks}]|$)|[^${breaks}]+?([${breaks}]|$)`,
          "g"
        );
        const lines = columnText.match(regex) || [];
        return leadingStr + lines.map((line, i) => {
          if (line === "\n")
            return "";
          return (i > 0 ? indentString : "") + line.trimEnd();
        }).join("\n");
      }
    };
    exports2.Help = Help2;
  }
});

// ../../../../../../../plugins/gitlab/infra/gitlab-action/node_modules/.pnpm/commander@12.1.0/node_modules/commander/lib/option.js
var require_option = __commonJS({
  "../../../../../../../plugins/gitlab/infra/gitlab-action/node_modules/.pnpm/commander@12.1.0/node_modules/commander/lib/option.js"(exports2) {
    var { InvalidArgumentError: InvalidArgumentError2 } = require_error();
    var Option2 = class {
      /**
       * Initialize a new `Option` with the given `flags` and `description`.
       *
       * @param {string} flags
       * @param {string} [description]
       */
      constructor(flags, description) {
        this.flags = flags;
        this.description = description || "";
        this.required = flags.includes("<");
        this.optional = flags.includes("[");
        this.variadic = /\w\.\.\.[>\]]$/.test(flags);
        this.mandatory = false;
        const optionFlags = splitOptionFlags(flags);
        this.short = optionFlags.shortFlag;
        this.long = optionFlags.longFlag;
        this.negate = false;
        if (this.long) {
          this.negate = this.long.startsWith("--no-");
        }
        this.defaultValue = void 0;
        this.defaultValueDescription = void 0;
        this.presetArg = void 0;
        this.envVar = void 0;
        this.parseArg = void 0;
        this.hidden = false;
        this.argChoices = void 0;
        this.conflictsWith = [];
        this.implied = void 0;
      }
      /**
       * Set the default value, and optionally supply the description to be displayed in the help.
       *
       * @param {*} value
       * @param {string} [description]
       * @return {Option}
       */
      default(value, description) {
        this.defaultValue = value;
        this.defaultValueDescription = description;
        return this;
      }
      /**
       * Preset to use when option used without option-argument, especially optional but also boolean and negated.
       * The custom processing (parseArg) is called.
       *
       * @example
       * new Option('--color').default('GREYSCALE').preset('RGB');
       * new Option('--donate [amount]').preset('20').argParser(parseFloat);
       *
       * @param {*} arg
       * @return {Option}
       */
      preset(arg) {
        this.presetArg = arg;
        return this;
      }
      /**
       * Add option name(s) that conflict with this option.
       * An error will be displayed if conflicting options are found during parsing.
       *
       * @example
       * new Option('--rgb').conflicts('cmyk');
       * new Option('--js').conflicts(['ts', 'jsx']);
       *
       * @param {(string | string[])} names
       * @return {Option}
       */
      conflicts(names) {
        this.conflictsWith = this.conflictsWith.concat(names);
        return this;
      }
      /**
       * Specify implied option values for when this option is set and the implied options are not.
       *
       * The custom processing (parseArg) is not called on the implied values.
       *
       * @example
       * program
       *   .addOption(new Option('--log', 'write logging information to file'))
       *   .addOption(new Option('--trace', 'log extra details').implies({ log: 'trace.txt' }));
       *
       * @param {object} impliedOptionValues
       * @return {Option}
       */
      implies(impliedOptionValues) {
        let newImplied = impliedOptionValues;
        if (typeof impliedOptionValues === "string") {
          newImplied = { [impliedOptionValues]: true };
        }
        this.implied = Object.assign(this.implied || {}, newImplied);
        return this;
      }
      /**
       * Set environment variable to check for option value.
       *
       * An environment variable is only used if when processed the current option value is
       * undefined, or the source of the current value is 'default' or 'config' or 'env'.
       *
       * @param {string} name
       * @return {Option}
       */
      env(name) {
        this.envVar = name;
        return this;
      }
      /**
       * Set the custom handler for processing CLI option arguments into option values.
       *
       * @param {Function} [fn]
       * @return {Option}
       */
      argParser(fn) {
        this.parseArg = fn;
        return this;
      }
      /**
       * Whether the option is mandatory and must have a value after parsing.
       *
       * @param {boolean} [mandatory=true]
       * @return {Option}
       */
      makeOptionMandatory(mandatory = true) {
        this.mandatory = !!mandatory;
        return this;
      }
      /**
       * Hide option in help.
       *
       * @param {boolean} [hide=true]
       * @return {Option}
       */
      hideHelp(hide = true) {
        this.hidden = !!hide;
        return this;
      }
      /**
       * @package
       */
      _concatValue(value, previous) {
        if (previous === this.defaultValue || !Array.isArray(previous)) {
          return [value];
        }
        return previous.concat(value);
      }
      /**
       * Only allow option value to be one of choices.
       *
       * @param {string[]} values
       * @return {Option}
       */
      choices(values) {
        this.argChoices = values.slice();
        this.parseArg = (arg, previous) => {
          if (!this.argChoices.includes(arg)) {
            throw new InvalidArgumentError2(
              `Allowed choices are ${this.argChoices.join(", ")}.`
            );
          }
          if (this.variadic) {
            return this._concatValue(arg, previous);
          }
          return arg;
        };
        return this;
      }
      /**
       * Return option name.
       *
       * @return {string}
       */
      name() {
        if (this.long) {
          return this.long.replace(/^--/, "");
        }
        return this.short.replace(/^-/, "");
      }
      /**
       * Return option name, in a camelcase format that can be used
       * as a object attribute key.
       *
       * @return {string}
       */
      attributeName() {
        return camelcase(this.name().replace(/^no-/, ""));
      }
      /**
       * Check if `arg` matches the short or long flag.
       *
       * @param {string} arg
       * @return {boolean}
       * @package
       */
      is(arg) {
        return this.short === arg || this.long === arg;
      }
      /**
       * Return whether a boolean option.
       *
       * Options are one of boolean, negated, required argument, or optional argument.
       *
       * @return {boolean}
       * @package
       */
      isBoolean() {
        return !this.required && !this.optional && !this.negate;
      }
    };
    var DualOptions = class {
      /**
       * @param {Option[]} options
       */
      constructor(options) {
        this.positiveOptions = /* @__PURE__ */ new Map();
        this.negativeOptions = /* @__PURE__ */ new Map();
        this.dualOptions = /* @__PURE__ */ new Set();
        options.forEach((option) => {
          if (option.negate) {
            this.negativeOptions.set(option.attributeName(), option);
          } else {
            this.positiveOptions.set(option.attributeName(), option);
          }
        });
        this.negativeOptions.forEach((value, key) => {
          if (this.positiveOptions.has(key)) {
            this.dualOptions.add(key);
          }
        });
      }
      /**
       * Did the value come from the option, and not from possible matching dual option?
       *
       * @param {*} value
       * @param {Option} option
       * @returns {boolean}
       */
      valueFromOption(value, option) {
        const optionKey = option.attributeName();
        if (!this.dualOptions.has(optionKey))
          return true;
        const preset = this.negativeOptions.get(optionKey).presetArg;
        const negativeValue = preset !== void 0 ? preset : false;
        return option.negate === (negativeValue === value);
      }
    };
    function camelcase(str) {
      return str.split("-").reduce((str2, word) => {
        return str2 + word[0].toUpperCase() + word.slice(1);
      });
    }
    function splitOptionFlags(flags) {
      let shortFlag;
      let longFlag;
      const flagParts = flags.split(/[ |,]+/);
      if (flagParts.length > 1 && !/^[[<]/.test(flagParts[1]))
        shortFlag = flagParts.shift();
      longFlag = flagParts.shift();
      if (!shortFlag && /^-[^-]$/.test(longFlag)) {
        shortFlag = longFlag;
        longFlag = void 0;
      }
      return { shortFlag, longFlag };
    }
    exports2.Option = Option2;
    exports2.DualOptions = DualOptions;
  }
});

// ../../../../../../../plugins/gitlab/infra/gitlab-action/node_modules/.pnpm/commander@12.1.0/node_modules/commander/lib/suggestSimilar.js
var require_suggestSimilar = __commonJS({
  "../../../../../../../plugins/gitlab/infra/gitlab-action/node_modules/.pnpm/commander@12.1.0/node_modules/commander/lib/suggestSimilar.js"(exports2) {
    var maxDistance = 3;
    function editDistance(a, b) {
      if (Math.abs(a.length - b.length) > maxDistance)
        return Math.max(a.length, b.length);
      const d = [];
      for (let i = 0; i <= a.length; i++) {
        d[i] = [i];
      }
      for (let j = 0; j <= b.length; j++) {
        d[0][j] = j;
      }
      for (let j = 1; j <= b.length; j++) {
        for (let i = 1; i <= a.length; i++) {
          let cost = 1;
          if (a[i - 1] === b[j - 1]) {
            cost = 0;
          } else {
            cost = 1;
          }
          d[i][j] = Math.min(
            d[i - 1][j] + 1,
            // deletion
            d[i][j - 1] + 1,
            // insertion
            d[i - 1][j - 1] + cost
            // substitution
          );
          if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
            d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
          }
        }
      }
      return d[a.length][b.length];
    }
    function suggestSimilar(word, candidates) {
      if (!candidates || candidates.length === 0)
        return "";
      candidates = Array.from(new Set(candidates));
      const searchingOptions = word.startsWith("--");
      if (searchingOptions) {
        word = word.slice(2);
        candidates = candidates.map((candidate) => candidate.slice(2));
      }
      let similar = [];
      let bestDistance = maxDistance;
      const minSimilarity = 0.4;
      candidates.forEach((candidate) => {
        if (candidate.length <= 1)
          return;
        const distance = editDistance(word, candidate);
        const length = Math.max(word.length, candidate.length);
        const similarity = (length - distance) / length;
        if (similarity > minSimilarity) {
          if (distance < bestDistance) {
            bestDistance = distance;
            similar = [candidate];
          } else if (distance === bestDistance) {
            similar.push(candidate);
          }
        }
      });
      similar.sort((a, b) => a.localeCompare(b));
      if (searchingOptions) {
        similar = similar.map((candidate) => `--${candidate}`);
      }
      if (similar.length > 1) {
        return `
(Did you mean one of ${similar.join(", ")}?)`;
      }
      if (similar.length === 1) {
        return `
(Did you mean ${similar[0]}?)`;
      }
      return "";
    }
    exports2.suggestSimilar = suggestSimilar;
  }
});

// ../../../../../../../plugins/gitlab/infra/gitlab-action/node_modules/.pnpm/commander@12.1.0/node_modules/commander/lib/command.js
var require_command = __commonJS({
  "../../../../../../../plugins/gitlab/infra/gitlab-action/node_modules/.pnpm/commander@12.1.0/node_modules/commander/lib/command.js"(exports2) {
    var EventEmitter = require("node:events").EventEmitter;
    var childProcess = require("node:child_process");
    var path = require("node:path");
    var fs = require("node:fs");
    var process2 = require("node:process");
    var { Argument: Argument2, humanReadableArgName } = require_argument();
    var { CommanderError: CommanderError2 } = require_error();
    var { Help: Help2 } = require_help();
    var { Option: Option2, DualOptions } = require_option();
    var { suggestSimilar } = require_suggestSimilar();
    var Command2 = class _Command extends EventEmitter {
      /**
       * Initialize a new `Command`.
       *
       * @param {string} [name]
       */
      constructor(name) {
        super();
        this.commands = [];
        this.options = [];
        this.parent = null;
        this._allowUnknownOption = false;
        this._allowExcessArguments = true;
        this.registeredArguments = [];
        this._args = this.registeredArguments;
        this.args = [];
        this.rawArgs = [];
        this.processedArgs = [];
        this._scriptPath = null;
        this._name = name || "";
        this._optionValues = {};
        this._optionValueSources = {};
        this._storeOptionsAsProperties = false;
        this._actionHandler = null;
        this._executableHandler = false;
        this._executableFile = null;
        this._executableDir = null;
        this._defaultCommandName = null;
        this._exitCallback = null;
        this._aliases = [];
        this._combineFlagAndOptionalValue = true;
        this._description = "";
        this._summary = "";
        this._argsDescription = void 0;
        this._enablePositionalOptions = false;
        this._passThroughOptions = false;
        this._lifeCycleHooks = {};
        this._showHelpAfterError = false;
        this._showSuggestionAfterError = true;
        this._outputConfiguration = {
          writeOut: (str) => process2.stdout.write(str),
          writeErr: (str) => process2.stderr.write(str),
          getOutHelpWidth: () => process2.stdout.isTTY ? process2.stdout.columns : void 0,
          getErrHelpWidth: () => process2.stderr.isTTY ? process2.stderr.columns : void 0,
          outputError: (str, write) => write(str)
        };
        this._hidden = false;
        this._helpOption = void 0;
        this._addImplicitHelpCommand = void 0;
        this._helpCommand = void 0;
        this._helpConfiguration = {};
      }
      /**
       * Copy settings that are useful to have in common across root command and subcommands.
       *
       * (Used internally when adding a command using `.command()` so subcommands inherit parent settings.)
       *
       * @param {Command} sourceCommand
       * @return {Command} `this` command for chaining
       */
      copyInheritedSettings(sourceCommand) {
        this._outputConfiguration = sourceCommand._outputConfiguration;
        this._helpOption = sourceCommand._helpOption;
        this._helpCommand = sourceCommand._helpCommand;
        this._helpConfiguration = sourceCommand._helpConfiguration;
        this._exitCallback = sourceCommand._exitCallback;
        this._storeOptionsAsProperties = sourceCommand._storeOptionsAsProperties;
        this._combineFlagAndOptionalValue = sourceCommand._combineFlagAndOptionalValue;
        this._allowExcessArguments = sourceCommand._allowExcessArguments;
        this._enablePositionalOptions = sourceCommand._enablePositionalOptions;
        this._showHelpAfterError = sourceCommand._showHelpAfterError;
        this._showSuggestionAfterError = sourceCommand._showSuggestionAfterError;
        return this;
      }
      /**
       * @returns {Command[]}
       * @private
       */
      _getCommandAndAncestors() {
        const result = [];
        for (let command = this; command; command = command.parent) {
          result.push(command);
        }
        return result;
      }
      /**
       * Define a command.
       *
       * There are two styles of command: pay attention to where to put the description.
       *
       * @example
       * // Command implemented using action handler (description is supplied separately to `.command`)
       * program
       *   .command('clone <source> [destination]')
       *   .description('clone a repository into a newly created directory')
       *   .action((source, destination) => {
       *     console.log('clone command called');
       *   });
       *
       * // Command implemented using separate executable file (description is second parameter to `.command`)
       * program
       *   .command('start <service>', 'start named service')
       *   .command('stop [service]', 'stop named service, or all if no name supplied');
       *
       * @param {string} nameAndArgs - command name and arguments, args are `<required>` or `[optional]` and last may also be `variadic...`
       * @param {(object | string)} [actionOptsOrExecDesc] - configuration options (for action), or description (for executable)
       * @param {object} [execOpts] - configuration options (for executable)
       * @return {Command} returns new command for action handler, or `this` for executable command
       */
      command(nameAndArgs, actionOptsOrExecDesc, execOpts) {
        let desc = actionOptsOrExecDesc;
        let opts = execOpts;
        if (typeof desc === "object" && desc !== null) {
          opts = desc;
          desc = null;
        }
        opts = opts || {};
        const [, name, args] = nameAndArgs.match(/([^ ]+) *(.*)/);
        const cmd = this.createCommand(name);
        if (desc) {
          cmd.description(desc);
          cmd._executableHandler = true;
        }
        if (opts.isDefault)
          this._defaultCommandName = cmd._name;
        cmd._hidden = !!(opts.noHelp || opts.hidden);
        cmd._executableFile = opts.executableFile || null;
        if (args)
          cmd.arguments(args);
        this._registerCommand(cmd);
        cmd.parent = this;
        cmd.copyInheritedSettings(this);
        if (desc)
          return this;
        return cmd;
      }
      /**
       * Factory routine to create a new unattached command.
       *
       * See .command() for creating an attached subcommand, which uses this routine to
       * create the command. You can override createCommand to customise subcommands.
       *
       * @param {string} [name]
       * @return {Command} new command
       */
      createCommand(name) {
        return new _Command(name);
      }
      /**
       * You can customise the help with a subclass of Help by overriding createHelp,
       * or by overriding Help properties using configureHelp().
       *
       * @return {Help}
       */
      createHelp() {
        return Object.assign(new Help2(), this.configureHelp());
      }
      /**
       * You can customise the help by overriding Help properties using configureHelp(),
       * or with a subclass of Help by overriding createHelp().
       *
       * @param {object} [configuration] - configuration options
       * @return {(Command | object)} `this` command for chaining, or stored configuration
       */
      configureHelp(configuration) {
        if (configuration === void 0)
          return this._helpConfiguration;
        this._helpConfiguration = configuration;
        return this;
      }
      /**
       * The default output goes to stdout and stderr. You can customise this for special
       * applications. You can also customise the display of errors by overriding outputError.
       *
       * The configuration properties are all functions:
       *
       *     // functions to change where being written, stdout and stderr
       *     writeOut(str)
       *     writeErr(str)
       *     // matching functions to specify width for wrapping help
       *     getOutHelpWidth()
       *     getErrHelpWidth()
       *     // functions based on what is being written out
       *     outputError(str, write) // used for displaying errors, and not used for displaying help
       *
       * @param {object} [configuration] - configuration options
       * @return {(Command | object)} `this` command for chaining, or stored configuration
       */
      configureOutput(configuration) {
        if (configuration === void 0)
          return this._outputConfiguration;
        Object.assign(this._outputConfiguration, configuration);
        return this;
      }
      /**
       * Display the help or a custom message after an error occurs.
       *
       * @param {(boolean|string)} [displayHelp]
       * @return {Command} `this` command for chaining
       */
      showHelpAfterError(displayHelp = true) {
        if (typeof displayHelp !== "string")
          displayHelp = !!displayHelp;
        this._showHelpAfterError = displayHelp;
        return this;
      }
      /**
       * Display suggestion of similar commands for unknown commands, or options for unknown options.
       *
       * @param {boolean} [displaySuggestion]
       * @return {Command} `this` command for chaining
       */
      showSuggestionAfterError(displaySuggestion = true) {
        this._showSuggestionAfterError = !!displaySuggestion;
        return this;
      }
      /**
       * Add a prepared subcommand.
       *
       * See .command() for creating an attached subcommand which inherits settings from its parent.
       *
       * @param {Command} cmd - new subcommand
       * @param {object} [opts] - configuration options
       * @return {Command} `this` command for chaining
       */
      addCommand(cmd, opts) {
        if (!cmd._name) {
          throw new Error(`Command passed to .addCommand() must have a name
- specify the name in Command constructor or using .name()`);
        }
        opts = opts || {};
        if (opts.isDefault)
          this._defaultCommandName = cmd._name;
        if (opts.noHelp || opts.hidden)
          cmd._hidden = true;
        this._registerCommand(cmd);
        cmd.parent = this;
        cmd._checkForBrokenPassThrough();
        return this;
      }
      /**
       * Factory routine to create a new unattached argument.
       *
       * See .argument() for creating an attached argument, which uses this routine to
       * create the argument. You can override createArgument to return a custom argument.
       *
       * @param {string} name
       * @param {string} [description]
       * @return {Argument} new argument
       */
      createArgument(name, description) {
        return new Argument2(name, description);
      }
      /**
       * Define argument syntax for command.
       *
       * The default is that the argument is required, and you can explicitly
       * indicate this with <> around the name. Put [] around the name for an optional argument.
       *
       * @example
       * program.argument('<input-file>');
       * program.argument('[output-file]');
       *
       * @param {string} name
       * @param {string} [description]
       * @param {(Function|*)} [fn] - custom argument processing function
       * @param {*} [defaultValue]
       * @return {Command} `this` command for chaining
       */
      argument(name, description, fn, defaultValue) {
        const argument = this.createArgument(name, description);
        if (typeof fn === "function") {
          argument.default(defaultValue).argParser(fn);
        } else {
          argument.default(fn);
        }
        this.addArgument(argument);
        return this;
      }
      /**
       * Define argument syntax for command, adding multiple at once (without descriptions).
       *
       * See also .argument().
       *
       * @example
       * program.arguments('<cmd> [env]');
       *
       * @param {string} names
       * @return {Command} `this` command for chaining
       */
      arguments(names) {
        names.trim().split(/ +/).forEach((detail) => {
          this.argument(detail);
        });
        return this;
      }
      /**
       * Define argument syntax for command, adding a prepared argument.
       *
       * @param {Argument} argument
       * @return {Command} `this` command for chaining
       */
      addArgument(argument) {
        const previousArgument = this.registeredArguments.slice(-1)[0];
        if (previousArgument && previousArgument.variadic) {
          throw new Error(
            `only the last argument can be variadic '${previousArgument.name()}'`
          );
        }
        if (argument.required && argument.defaultValue !== void 0 && argument.parseArg === void 0) {
          throw new Error(
            `a default value for a required argument is never used: '${argument.name()}'`
          );
        }
        this.registeredArguments.push(argument);
        return this;
      }
      /**
       * Customise or override default help command. By default a help command is automatically added if your command has subcommands.
       *
       * @example
       *    program.helpCommand('help [cmd]');
       *    program.helpCommand('help [cmd]', 'show help');
       *    program.helpCommand(false); // suppress default help command
       *    program.helpCommand(true); // add help command even if no subcommands
       *
       * @param {string|boolean} enableOrNameAndArgs - enable with custom name and/or arguments, or boolean to override whether added
       * @param {string} [description] - custom description
       * @return {Command} `this` command for chaining
       */
      helpCommand(enableOrNameAndArgs, description) {
        if (typeof enableOrNameAndArgs === "boolean") {
          this._addImplicitHelpCommand = enableOrNameAndArgs;
          return this;
        }
        enableOrNameAndArgs = enableOrNameAndArgs ?? "help [command]";
        const [, helpName, helpArgs] = enableOrNameAndArgs.match(/([^ ]+) *(.*)/);
        const helpDescription = description ?? "display help for command";
        const helpCommand = this.createCommand(helpName);
        helpCommand.helpOption(false);
        if (helpArgs)
          helpCommand.arguments(helpArgs);
        if (helpDescription)
          helpCommand.description(helpDescription);
        this._addImplicitHelpCommand = true;
        this._helpCommand = helpCommand;
        return this;
      }
      /**
       * Add prepared custom help command.
       *
       * @param {(Command|string|boolean)} helpCommand - custom help command, or deprecated enableOrNameAndArgs as for `.helpCommand()`
       * @param {string} [deprecatedDescription] - deprecated custom description used with custom name only
       * @return {Command} `this` command for chaining
       */
      addHelpCommand(helpCommand, deprecatedDescription) {
        if (typeof helpCommand !== "object") {
          this.helpCommand(helpCommand, deprecatedDescription);
          return this;
        }
        this._addImplicitHelpCommand = true;
        this._helpCommand = helpCommand;
        return this;
      }
      /**
       * Lazy create help command.
       *
       * @return {(Command|null)}
       * @package
       */
      _getHelpCommand() {
        const hasImplicitHelpCommand = this._addImplicitHelpCommand ?? (this.commands.length && !this._actionHandler && !this._findCommand("help"));
        if (hasImplicitHelpCommand) {
          if (this._helpCommand === void 0) {
            this.helpCommand(void 0, void 0);
          }
          return this._helpCommand;
        }
        return null;
      }
      /**
       * Add hook for life cycle event.
       *
       * @param {string} event
       * @param {Function} listener
       * @return {Command} `this` command for chaining
       */
      hook(event, listener) {
        const allowedValues = ["preSubcommand", "preAction", "postAction"];
        if (!allowedValues.includes(event)) {
          throw new Error(`Unexpected value for event passed to hook : '${event}'.
Expecting one of '${allowedValues.join("', '")}'`);
        }
        if (this._lifeCycleHooks[event]) {
          this._lifeCycleHooks[event].push(listener);
        } else {
          this._lifeCycleHooks[event] = [listener];
        }
        return this;
      }
      /**
       * Register callback to use as replacement for calling process.exit.
       *
       * @param {Function} [fn] optional callback which will be passed a CommanderError, defaults to throwing
       * @return {Command} `this` command for chaining
       */
      exitOverride(fn) {
        if (fn) {
          this._exitCallback = fn;
        } else {
          this._exitCallback = (err) => {
            if (err.code !== "commander.executeSubCommandAsync") {
              throw err;
            } else {
            }
          };
        }
        return this;
      }
      /**
       * Call process.exit, and _exitCallback if defined.
       *
       * @param {number} exitCode exit code for using with process.exit
       * @param {string} code an id string representing the error
       * @param {string} message human-readable description of the error
       * @return never
       * @private
       */
      _exit(exitCode, code, message) {
        if (this._exitCallback) {
          this._exitCallback(new CommanderError2(exitCode, code, message));
        }
        process2.exit(exitCode);
      }
      /**
       * Register callback `fn` for the command.
       *
       * @example
       * program
       *   .command('serve')
       *   .description('start service')
       *   .action(function() {
       *      // do work here
       *   });
       *
       * @param {Function} fn
       * @return {Command} `this` command for chaining
       */
      action(fn) {
        const listener = (args) => {
          const expectedArgsCount = this.registeredArguments.length;
          const actionArgs = args.slice(0, expectedArgsCount);
          if (this._storeOptionsAsProperties) {
            actionArgs[expectedArgsCount] = this;
          } else {
            actionArgs[expectedArgsCount] = this.opts();
          }
          actionArgs.push(this);
          return fn.apply(this, actionArgs);
        };
        this._actionHandler = listener;
        return this;
      }
      /**
       * Factory routine to create a new unattached option.
       *
       * See .option() for creating an attached option, which uses this routine to
       * create the option. You can override createOption to return a custom option.
       *
       * @param {string} flags
       * @param {string} [description]
       * @return {Option} new option
       */
      createOption(flags, description) {
        return new Option2(flags, description);
      }
      /**
       * Wrap parseArgs to catch 'commander.invalidArgument'.
       *
       * @param {(Option | Argument)} target
       * @param {string} value
       * @param {*} previous
       * @param {string} invalidArgumentMessage
       * @private
       */
      _callParseArg(target, value, previous, invalidArgumentMessage) {
        try {
          return target.parseArg(value, previous);
        } catch (err) {
          if (err.code === "commander.invalidArgument") {
            const message = `${invalidArgumentMessage} ${err.message}`;
            this.error(message, { exitCode: err.exitCode, code: err.code });
          }
          throw err;
        }
      }
      /**
       * Check for option flag conflicts.
       * Register option if no conflicts found, or throw on conflict.
       *
       * @param {Option} option
       * @private
       */
      _registerOption(option) {
        const matchingOption = option.short && this._findOption(option.short) || option.long && this._findOption(option.long);
        if (matchingOption) {
          const matchingFlag = option.long && this._findOption(option.long) ? option.long : option.short;
          throw new Error(`Cannot add option '${option.flags}'${this._name && ` to command '${this._name}'`} due to conflicting flag '${matchingFlag}'
-  already used by option '${matchingOption.flags}'`);
        }
        this.options.push(option);
      }
      /**
       * Check for command name and alias conflicts with existing commands.
       * Register command if no conflicts found, or throw on conflict.
       *
       * @param {Command} command
       * @private
       */
      _registerCommand(command) {
        const knownBy = (cmd) => {
          return [cmd.name()].concat(cmd.aliases());
        };
        const alreadyUsed = knownBy(command).find(
          (name) => this._findCommand(name)
        );
        if (alreadyUsed) {
          const existingCmd = knownBy(this._findCommand(alreadyUsed)).join("|");
          const newCmd = knownBy(command).join("|");
          throw new Error(
            `cannot add command '${newCmd}' as already have command '${existingCmd}'`
          );
        }
        this.commands.push(command);
      }
      /**
       * Add an option.
       *
       * @param {Option} option
       * @return {Command} `this` command for chaining
       */
      addOption(option) {
        this._registerOption(option);
        const oname = option.name();
        const name = option.attributeName();
        if (option.negate) {
          const positiveLongFlag = option.long.replace(/^--no-/, "--");
          if (!this._findOption(positiveLongFlag)) {
            this.setOptionValueWithSource(
              name,
              option.defaultValue === void 0 ? true : option.defaultValue,
              "default"
            );
          }
        } else if (option.defaultValue !== void 0) {
          this.setOptionValueWithSource(name, option.defaultValue, "default");
        }
        const handleOptionValue = (val, invalidValueMessage, valueSource) => {
          if (val == null && option.presetArg !== void 0) {
            val = option.presetArg;
          }
          const oldValue = this.getOptionValue(name);
          if (val !== null && option.parseArg) {
            val = this._callParseArg(option, val, oldValue, invalidValueMessage);
          } else if (val !== null && option.variadic) {
            val = option._concatValue(val, oldValue);
          }
          if (val == null) {
            if (option.negate) {
              val = false;
            } else if (option.isBoolean() || option.optional) {
              val = true;
            } else {
              val = "";
            }
          }
          this.setOptionValueWithSource(name, val, valueSource);
        };
        this.on("option:" + oname, (val) => {
          const invalidValueMessage = `error: option '${option.flags}' argument '${val}' is invalid.`;
          handleOptionValue(val, invalidValueMessage, "cli");
        });
        if (option.envVar) {
          this.on("optionEnv:" + oname, (val) => {
            const invalidValueMessage = `error: option '${option.flags}' value '${val}' from env '${option.envVar}' is invalid.`;
            handleOptionValue(val, invalidValueMessage, "env");
          });
        }
        return this;
      }
      /**
       * Internal implementation shared by .option() and .requiredOption()
       *
       * @return {Command} `this` command for chaining
       * @private
       */
      _optionEx(config, flags, description, fn, defaultValue) {
        if (typeof flags === "object" && flags instanceof Option2) {
          throw new Error(
            "To add an Option object use addOption() instead of option() or requiredOption()"
          );
        }
        const option = this.createOption(flags, description);
        option.makeOptionMandatory(!!config.mandatory);
        if (typeof fn === "function") {
          option.default(defaultValue).argParser(fn);
        } else if (fn instanceof RegExp) {
          const regex = fn;
          fn = (val, def) => {
            const m = regex.exec(val);
            return m ? m[0] : def;
          };
          option.default(defaultValue).argParser(fn);
        } else {
          option.default(fn);
        }
        return this.addOption(option);
      }
      /**
       * Define option with `flags`, `description`, and optional argument parsing function or `defaultValue` or both.
       *
       * The `flags` string contains the short and/or long flags, separated by comma, a pipe or space. A required
       * option-argument is indicated by `<>` and an optional option-argument by `[]`.
       *
       * See the README for more details, and see also addOption() and requiredOption().
       *
       * @example
       * program
       *     .option('-p, --pepper', 'add pepper')
       *     .option('-p, --pizza-type <TYPE>', 'type of pizza') // required option-argument
       *     .option('-c, --cheese [CHEESE]', 'add extra cheese', 'mozzarella') // optional option-argument with default
       *     .option('-t, --tip <VALUE>', 'add tip to purchase cost', parseFloat) // custom parse function
       *
       * @param {string} flags
       * @param {string} [description]
       * @param {(Function|*)} [parseArg] - custom option processing function or default value
       * @param {*} [defaultValue]
       * @return {Command} `this` command for chaining
       */
      option(flags, description, parseArg, defaultValue) {
        return this._optionEx({}, flags, description, parseArg, defaultValue);
      }
      /**
       * Add a required option which must have a value after parsing. This usually means
       * the option must be specified on the command line. (Otherwise the same as .option().)
       *
       * The `flags` string contains the short and/or long flags, separated by comma, a pipe or space.
       *
       * @param {string} flags
       * @param {string} [description]
       * @param {(Function|*)} [parseArg] - custom option processing function or default value
       * @param {*} [defaultValue]
       * @return {Command} `this` command for chaining
       */
      requiredOption(flags, description, parseArg, defaultValue) {
        return this._optionEx(
          { mandatory: true },
          flags,
          description,
          parseArg,
          defaultValue
        );
      }
      /**
       * Alter parsing of short flags with optional values.
       *
       * @example
       * // for `.option('-f,--flag [value]'):
       * program.combineFlagAndOptionalValue(true);  // `-f80` is treated like `--flag=80`, this is the default behaviour
       * program.combineFlagAndOptionalValue(false) // `-fb` is treated like `-f -b`
       *
       * @param {boolean} [combine] - if `true` or omitted, an optional value can be specified directly after the flag.
       * @return {Command} `this` command for chaining
       */
      combineFlagAndOptionalValue(combine = true) {
        this._combineFlagAndOptionalValue = !!combine;
        return this;
      }
      /**
       * Allow unknown options on the command line.
       *
       * @param {boolean} [allowUnknown] - if `true` or omitted, no error will be thrown for unknown options.
       * @return {Command} `this` command for chaining
       */
      allowUnknownOption(allowUnknown = true) {
        this._allowUnknownOption = !!allowUnknown;
        return this;
      }
      /**
       * Allow excess command-arguments on the command line. Pass false to make excess arguments an error.
       *
       * @param {boolean} [allowExcess] - if `true` or omitted, no error will be thrown for excess arguments.
       * @return {Command} `this` command for chaining
       */
      allowExcessArguments(allowExcess = true) {
        this._allowExcessArguments = !!allowExcess;
        return this;
      }
      /**
       * Enable positional options. Positional means global options are specified before subcommands which lets
       * subcommands reuse the same option names, and also enables subcommands to turn on passThroughOptions.
       * The default behaviour is non-positional and global options may appear anywhere on the command line.
       *
       * @param {boolean} [positional]
       * @return {Command} `this` command for chaining
       */
      enablePositionalOptions(positional = true) {
        this._enablePositionalOptions = !!positional;
        return this;
      }
      /**
       * Pass through options that come after command-arguments rather than treat them as command-options,
       * so actual command-options come before command-arguments. Turning this on for a subcommand requires
       * positional options to have been enabled on the program (parent commands).
       * The default behaviour is non-positional and options may appear before or after command-arguments.
       *
       * @param {boolean} [passThrough] for unknown options.
       * @return {Command} `this` command for chaining
       */
      passThroughOptions(passThrough = true) {
        this._passThroughOptions = !!passThrough;
        this._checkForBrokenPassThrough();
        return this;
      }
      /**
       * @private
       */
      _checkForBrokenPassThrough() {
        if (this.parent && this._passThroughOptions && !this.parent._enablePositionalOptions) {
          throw new Error(
            `passThroughOptions cannot be used for '${this._name}' without turning on enablePositionalOptions for parent command(s)`
          );
        }
      }
      /**
       * Whether to store option values as properties on command object,
       * or store separately (specify false). In both cases the option values can be accessed using .opts().
       *
       * @param {boolean} [storeAsProperties=true]
       * @return {Command} `this` command for chaining
       */
      storeOptionsAsProperties(storeAsProperties = true) {
        if (this.options.length) {
          throw new Error("call .storeOptionsAsProperties() before adding options");
        }
        if (Object.keys(this._optionValues).length) {
          throw new Error(
            "call .storeOptionsAsProperties() before setting option values"
          );
        }
        this._storeOptionsAsProperties = !!storeAsProperties;
        return this;
      }
      /**
       * Retrieve option value.
       *
       * @param {string} key
       * @return {object} value
       */
      getOptionValue(key) {
        if (this._storeOptionsAsProperties) {
          return this[key];
        }
        return this._optionValues[key];
      }
      /**
       * Store option value.
       *
       * @param {string} key
       * @param {object} value
       * @return {Command} `this` command for chaining
       */
      setOptionValue(key, value) {
        return this.setOptionValueWithSource(key, value, void 0);
      }
      /**
       * Store option value and where the value came from.
       *
       * @param {string} key
       * @param {object} value
       * @param {string} source - expected values are default/config/env/cli/implied
       * @return {Command} `this` command for chaining
       */
      setOptionValueWithSource(key, value, source) {
        if (this._storeOptionsAsProperties) {
          this[key] = value;
        } else {
          this._optionValues[key] = value;
        }
        this._optionValueSources[key] = source;
        return this;
      }
      /**
       * Get source of option value.
       * Expected values are default | config | env | cli | implied
       *
       * @param {string} key
       * @return {string}
       */
      getOptionValueSource(key) {
        return this._optionValueSources[key];
      }
      /**
       * Get source of option value. See also .optsWithGlobals().
       * Expected values are default | config | env | cli | implied
       *
       * @param {string} key
       * @return {string}
       */
      getOptionValueSourceWithGlobals(key) {
        let source;
        this._getCommandAndAncestors().forEach((cmd) => {
          if (cmd.getOptionValueSource(key) !== void 0) {
            source = cmd.getOptionValueSource(key);
          }
        });
        return source;
      }
      /**
       * Get user arguments from implied or explicit arguments.
       * Side-effects: set _scriptPath if args included script. Used for default program name, and subcommand searches.
       *
       * @private
       */
      _prepareUserArgs(argv, parseOptions) {
        if (argv !== void 0 && !Array.isArray(argv)) {
          throw new Error("first parameter to parse must be array or undefined");
        }
        parseOptions = parseOptions || {};
        if (argv === void 0 && parseOptions.from === void 0) {
          if (process2.versions?.electron) {
            parseOptions.from = "electron";
          }
          const execArgv = process2.execArgv ?? [];
          if (execArgv.includes("-e") || execArgv.includes("--eval") || execArgv.includes("-p") || execArgv.includes("--print")) {
            parseOptions.from = "eval";
          }
        }
        if (argv === void 0) {
          argv = process2.argv;
        }
        this.rawArgs = argv.slice();
        let userArgs;
        switch (parseOptions.from) {
          case void 0:
          case "node":
            this._scriptPath = argv[1];
            userArgs = argv.slice(2);
            break;
          case "electron":
            if (process2.defaultApp) {
              this._scriptPath = argv[1];
              userArgs = argv.slice(2);
            } else {
              userArgs = argv.slice(1);
            }
            break;
          case "user":
            userArgs = argv.slice(0);
            break;
          case "eval":
            userArgs = argv.slice(1);
            break;
          default:
            throw new Error(
              `unexpected parse option { from: '${parseOptions.from}' }`
            );
        }
        if (!this._name && this._scriptPath)
          this.nameFromFilename(this._scriptPath);
        this._name = this._name || "program";
        return userArgs;
      }
      /**
       * Parse `argv`, setting options and invoking commands when defined.
       *
       * Use parseAsync instead of parse if any of your action handlers are async.
       *
       * Call with no parameters to parse `process.argv`. Detects Electron and special node options like `node --eval`. Easy mode!
       *
       * Or call with an array of strings to parse, and optionally where the user arguments start by specifying where the arguments are `from`:
       * - `'node'`: default, `argv[0]` is the application and `argv[1]` is the script being run, with user arguments after that
       * - `'electron'`: `argv[0]` is the application and `argv[1]` varies depending on whether the electron application is packaged
       * - `'user'`: just user arguments
       *
       * @example
       * program.parse(); // parse process.argv and auto-detect electron and special node flags
       * program.parse(process.argv); // assume argv[0] is app and argv[1] is script
       * program.parse(my-args, { from: 'user' }); // just user supplied arguments, nothing special about argv[0]
       *
       * @param {string[]} [argv] - optional, defaults to process.argv
       * @param {object} [parseOptions] - optionally specify style of options with from: node/user/electron
       * @param {string} [parseOptions.from] - where the args are from: 'node', 'user', 'electron'
       * @return {Command} `this` command for chaining
       */
      parse(argv, parseOptions) {
        const userArgs = this._prepareUserArgs(argv, parseOptions);
        this._parseCommand([], userArgs);
        return this;
      }
      /**
       * Parse `argv`, setting options and invoking commands when defined.
       *
       * Call with no parameters to parse `process.argv`. Detects Electron and special node options like `node --eval`. Easy mode!
       *
       * Or call with an array of strings to parse, and optionally where the user arguments start by specifying where the arguments are `from`:
       * - `'node'`: default, `argv[0]` is the application and `argv[1]` is the script being run, with user arguments after that
       * - `'electron'`: `argv[0]` is the application and `argv[1]` varies depending on whether the electron application is packaged
       * - `'user'`: just user arguments
       *
       * @example
       * await program.parseAsync(); // parse process.argv and auto-detect electron and special node flags
       * await program.parseAsync(process.argv); // assume argv[0] is app and argv[1] is script
       * await program.parseAsync(my-args, { from: 'user' }); // just user supplied arguments, nothing special about argv[0]
       *
       * @param {string[]} [argv]
       * @param {object} [parseOptions]
       * @param {string} parseOptions.from - where the args are from: 'node', 'user', 'electron'
       * @return {Promise}
       */
      async parseAsync(argv, parseOptions) {
        const userArgs = this._prepareUserArgs(argv, parseOptions);
        await this._parseCommand([], userArgs);
        return this;
      }
      /**
       * Execute a sub-command executable.
       *
       * @private
       */
      _executeSubCommand(subcommand, args) {
        args = args.slice();
        let launchWithNode = false;
        const sourceExt = [".js", ".ts", ".tsx", ".mjs", ".cjs"];
        function findFile(baseDir, baseName) {
          const localBin = path.resolve(baseDir, baseName);
          if (fs.existsSync(localBin))
            return localBin;
          if (sourceExt.includes(path.extname(baseName)))
            return void 0;
          const foundExt = sourceExt.find(
            (ext) => fs.existsSync(`${localBin}${ext}`)
          );
          if (foundExt)
            return `${localBin}${foundExt}`;
          return void 0;
        }
        this._checkForMissingMandatoryOptions();
        this._checkForConflictingOptions();
        let executableFile = subcommand._executableFile || `${this._name}-${subcommand._name}`;
        let executableDir = this._executableDir || "";
        if (this._scriptPath) {
          let resolvedScriptPath;
          try {
            resolvedScriptPath = fs.realpathSync(this._scriptPath);
          } catch (err) {
            resolvedScriptPath = this._scriptPath;
          }
          executableDir = path.resolve(
            path.dirname(resolvedScriptPath),
            executableDir
          );
        }
        if (executableDir) {
          let localFile = findFile(executableDir, executableFile);
          if (!localFile && !subcommand._executableFile && this._scriptPath) {
            const legacyName = path.basename(
              this._scriptPath,
              path.extname(this._scriptPath)
            );
            if (legacyName !== this._name) {
              localFile = findFile(
                executableDir,
                `${legacyName}-${subcommand._name}`
              );
            }
          }
          executableFile = localFile || executableFile;
        }
        launchWithNode = sourceExt.includes(path.extname(executableFile));
        let proc;
        if (process2.platform !== "win32") {
          if (launchWithNode) {
            args.unshift(executableFile);
            args = incrementNodeInspectorPort(process2.execArgv).concat(args);
            proc = childProcess.spawn(process2.argv[0], args, { stdio: "inherit" });
          } else {
            proc = childProcess.spawn(executableFile, args, { stdio: "inherit" });
          }
        } else {
          args.unshift(executableFile);
          args = incrementNodeInspectorPort(process2.execArgv).concat(args);
          proc = childProcess.spawn(process2.execPath, args, { stdio: "inherit" });
        }
        if (!proc.killed) {
          const signals = ["SIGUSR1", "SIGUSR2", "SIGTERM", "SIGINT", "SIGHUP"];
          signals.forEach((signal) => {
            process2.on(signal, () => {
              if (proc.killed === false && proc.exitCode === null) {
                proc.kill(signal);
              }
            });
          });
        }
        const exitCallback = this._exitCallback;
        proc.on("close", (code) => {
          code = code ?? 1;
          if (!exitCallback) {
            process2.exit(code);
          } else {
            exitCallback(
              new CommanderError2(
                code,
                "commander.executeSubCommandAsync",
                "(close)"
              )
            );
          }
        });
        proc.on("error", (err) => {
          if (err.code === "ENOENT") {
            const executableDirMessage = executableDir ? `searched for local subcommand relative to directory '${executableDir}'` : "no directory for search for local subcommand, use .executableDir() to supply a custom directory";
            const executableMissing = `'${executableFile}' does not exist
 - if '${subcommand._name}' is not meant to be an executable command, remove description parameter from '.command()' and use '.description()' instead
 - if the default executable name is not suitable, use the executableFile option to supply a custom name or path
 - ${executableDirMessage}`;
            throw new Error(executableMissing);
          } else if (err.code === "EACCES") {
            throw new Error(`'${executableFile}' not executable`);
          }
          if (!exitCallback) {
            process2.exit(1);
          } else {
            const wrappedError = new CommanderError2(
              1,
              "commander.executeSubCommandAsync",
              "(error)"
            );
            wrappedError.nestedError = err;
            exitCallback(wrappedError);
          }
        });
        this.runningCommand = proc;
      }
      /**
       * @private
       */
      _dispatchSubcommand(commandName, operands, unknown) {
        const subCommand = this._findCommand(commandName);
        if (!subCommand)
          this.help({ error: true });
        let promiseChain;
        promiseChain = this._chainOrCallSubCommandHook(
          promiseChain,
          subCommand,
          "preSubcommand"
        );
        promiseChain = this._chainOrCall(promiseChain, () => {
          if (subCommand._executableHandler) {
            this._executeSubCommand(subCommand, operands.concat(unknown));
          } else {
            return subCommand._parseCommand(operands, unknown);
          }
        });
        return promiseChain;
      }
      /**
       * Invoke help directly if possible, or dispatch if necessary.
       * e.g. help foo
       *
       * @private
       */
      _dispatchHelpCommand(subcommandName) {
        if (!subcommandName) {
          this.help();
        }
        const subCommand = this._findCommand(subcommandName);
        if (subCommand && !subCommand._executableHandler) {
          subCommand.help();
        }
        return this._dispatchSubcommand(
          subcommandName,
          [],
          [this._getHelpOption()?.long ?? this._getHelpOption()?.short ?? "--help"]
        );
      }
      /**
       * Check this.args against expected this.registeredArguments.
       *
       * @private
       */
      _checkNumberOfArguments() {
        this.registeredArguments.forEach((arg, i) => {
          if (arg.required && this.args[i] == null) {
            this.missingArgument(arg.name());
          }
        });
        if (this.registeredArguments.length > 0 && this.registeredArguments[this.registeredArguments.length - 1].variadic) {
          return;
        }
        if (this.args.length > this.registeredArguments.length) {
          this._excessArguments(this.args);
        }
      }
      /**
       * Process this.args using this.registeredArguments and save as this.processedArgs!
       *
       * @private
       */
      _processArguments() {
        const myParseArg = (argument, value, previous) => {
          let parsedValue = value;
          if (value !== null && argument.parseArg) {
            const invalidValueMessage = `error: command-argument value '${value}' is invalid for argument '${argument.name()}'.`;
            parsedValue = this._callParseArg(
              argument,
              value,
              previous,
              invalidValueMessage
            );
          }
          return parsedValue;
        };
        this._checkNumberOfArguments();
        const processedArgs = [];
        this.registeredArguments.forEach((declaredArg, index) => {
          let value = declaredArg.defaultValue;
          if (declaredArg.variadic) {
            if (index < this.args.length) {
              value = this.args.slice(index);
              if (declaredArg.parseArg) {
                value = value.reduce((processed, v) => {
                  return myParseArg(declaredArg, v, processed);
                }, declaredArg.defaultValue);
              }
            } else if (value === void 0) {
              value = [];
            }
          } else if (index < this.args.length) {
            value = this.args[index];
            if (declaredArg.parseArg) {
              value = myParseArg(declaredArg, value, declaredArg.defaultValue);
            }
          }
          processedArgs[index] = value;
        });
        this.processedArgs = processedArgs;
      }
      /**
       * Once we have a promise we chain, but call synchronously until then.
       *
       * @param {(Promise|undefined)} promise
       * @param {Function} fn
       * @return {(Promise|undefined)}
       * @private
       */
      _chainOrCall(promise, fn) {
        if (promise && promise.then && typeof promise.then === "function") {
          return promise.then(() => fn());
        }
        return fn();
      }
      /**
       *
       * @param {(Promise|undefined)} promise
       * @param {string} event
       * @return {(Promise|undefined)}
       * @private
       */
      _chainOrCallHooks(promise, event) {
        let result = promise;
        const hooks = [];
        this._getCommandAndAncestors().reverse().filter((cmd) => cmd._lifeCycleHooks[event] !== void 0).forEach((hookedCommand) => {
          hookedCommand._lifeCycleHooks[event].forEach((callback) => {
            hooks.push({ hookedCommand, callback });
          });
        });
        if (event === "postAction") {
          hooks.reverse();
        }
        hooks.forEach((hookDetail) => {
          result = this._chainOrCall(result, () => {
            return hookDetail.callback(hookDetail.hookedCommand, this);
          });
        });
        return result;
      }
      /**
       *
       * @param {(Promise|undefined)} promise
       * @param {Command} subCommand
       * @param {string} event
       * @return {(Promise|undefined)}
       * @private
       */
      _chainOrCallSubCommandHook(promise, subCommand, event) {
        let result = promise;
        if (this._lifeCycleHooks[event] !== void 0) {
          this._lifeCycleHooks[event].forEach((hook) => {
            result = this._chainOrCall(result, () => {
              return hook(this, subCommand);
            });
          });
        }
        return result;
      }
      /**
       * Process arguments in context of this command.
       * Returns action result, in case it is a promise.
       *
       * @private
       */
      _parseCommand(operands, unknown) {
        const parsed = this.parseOptions(unknown);
        this._parseOptionsEnv();
        this._parseOptionsImplied();
        operands = operands.concat(parsed.operands);
        unknown = parsed.unknown;
        this.args = operands.concat(unknown);
        if (operands && this._findCommand(operands[0])) {
          return this._dispatchSubcommand(operands[0], operands.slice(1), unknown);
        }
        if (this._getHelpCommand() && operands[0] === this._getHelpCommand().name()) {
          return this._dispatchHelpCommand(operands[1]);
        }
        if (this._defaultCommandName) {
          this._outputHelpIfRequested(unknown);
          return this._dispatchSubcommand(
            this._defaultCommandName,
            operands,
            unknown
          );
        }
        if (this.commands.length && this.args.length === 0 && !this._actionHandler && !this._defaultCommandName) {
          this.help({ error: true });
        }
        this._outputHelpIfRequested(parsed.unknown);
        this._checkForMissingMandatoryOptions();
        this._checkForConflictingOptions();
        const checkForUnknownOptions = () => {
          if (parsed.unknown.length > 0) {
            this.unknownOption(parsed.unknown[0]);
          }
        };
        const commandEvent = `command:${this.name()}`;
        if (this._actionHandler) {
          checkForUnknownOptions();
          this._processArguments();
          let promiseChain;
          promiseChain = this._chainOrCallHooks(promiseChain, "preAction");
          promiseChain = this._chainOrCall(
            promiseChain,
            () => this._actionHandler(this.processedArgs)
          );
          if (this.parent) {
            promiseChain = this._chainOrCall(promiseChain, () => {
              this.parent.emit(commandEvent, operands, unknown);
            });
          }
          promiseChain = this._chainOrCallHooks(promiseChain, "postAction");
          return promiseChain;
        }
        if (this.parent && this.parent.listenerCount(commandEvent)) {
          checkForUnknownOptions();
          this._processArguments();
          this.parent.emit(commandEvent, operands, unknown);
        } else if (operands.length) {
          if (this._findCommand("*")) {
            return this._dispatchSubcommand("*", operands, unknown);
          }
          if (this.listenerCount("command:*")) {
            this.emit("command:*", operands, unknown);
          } else if (this.commands.length) {
            this.unknownCommand();
          } else {
            checkForUnknownOptions();
            this._processArguments();
          }
        } else if (this.commands.length) {
          checkForUnknownOptions();
          this.help({ error: true });
        } else {
          checkForUnknownOptions();
          this._processArguments();
        }
      }
      /**
       * Find matching command.
       *
       * @private
       * @return {Command | undefined}
       */
      _findCommand(name) {
        if (!name)
          return void 0;
        return this.commands.find(
          (cmd) => cmd._name === name || cmd._aliases.includes(name)
        );
      }
      /**
       * Return an option matching `arg` if any.
       *
       * @param {string} arg
       * @return {Option}
       * @package
       */
      _findOption(arg) {
        return this.options.find((option) => option.is(arg));
      }
      /**
       * Display an error message if a mandatory option does not have a value.
       * Called after checking for help flags in leaf subcommand.
       *
       * @private
       */
      _checkForMissingMandatoryOptions() {
        this._getCommandAndAncestors().forEach((cmd) => {
          cmd.options.forEach((anOption) => {
            if (anOption.mandatory && cmd.getOptionValue(anOption.attributeName()) === void 0) {
              cmd.missingMandatoryOptionValue(anOption);
            }
          });
        });
      }
      /**
       * Display an error message if conflicting options are used together in this.
       *
       * @private
       */
      _checkForConflictingLocalOptions() {
        const definedNonDefaultOptions = this.options.filter((option) => {
          const optionKey = option.attributeName();
          if (this.getOptionValue(optionKey) === void 0) {
            return false;
          }
          return this.getOptionValueSource(optionKey) !== "default";
        });
        const optionsWithConflicting = definedNonDefaultOptions.filter(
          (option) => option.conflictsWith.length > 0
        );
        optionsWithConflicting.forEach((option) => {
          const conflictingAndDefined = definedNonDefaultOptions.find(
            (defined) => option.conflictsWith.includes(defined.attributeName())
          );
          if (conflictingAndDefined) {
            this._conflictingOption(option, conflictingAndDefined);
          }
        });
      }
      /**
       * Display an error message if conflicting options are used together.
       * Called after checking for help flags in leaf subcommand.
       *
       * @private
       */
      _checkForConflictingOptions() {
        this._getCommandAndAncestors().forEach((cmd) => {
          cmd._checkForConflictingLocalOptions();
        });
      }
      /**
       * Parse options from `argv` removing known options,
       * and return argv split into operands and unknown arguments.
       *
       * Examples:
       *
       *     argv => operands, unknown
       *     --known kkk op => [op], []
       *     op --known kkk => [op], []
       *     sub --unknown uuu op => [sub], [--unknown uuu op]
       *     sub -- --unknown uuu op => [sub --unknown uuu op], []
       *
       * @param {string[]} argv
       * @return {{operands: string[], unknown: string[]}}
       */
      parseOptions(argv) {
        const operands = [];
        const unknown = [];
        let dest = operands;
        const args = argv.slice();
        function maybeOption(arg) {
          return arg.length > 1 && arg[0] === "-";
        }
        let activeVariadicOption = null;
        while (args.length) {
          const arg = args.shift();
          if (arg === "--") {
            if (dest === unknown)
              dest.push(arg);
            dest.push(...args);
            break;
          }
          if (activeVariadicOption && !maybeOption(arg)) {
            this.emit(`option:${activeVariadicOption.name()}`, arg);
            continue;
          }
          activeVariadicOption = null;
          if (maybeOption(arg)) {
            const option = this._findOption(arg);
            if (option) {
              if (option.required) {
                const value = args.shift();
                if (value === void 0)
                  this.optionMissingArgument(option);
                this.emit(`option:${option.name()}`, value);
              } else if (option.optional) {
                let value = null;
                if (args.length > 0 && !maybeOption(args[0])) {
                  value = args.shift();
                }
                this.emit(`option:${option.name()}`, value);
              } else {
                this.emit(`option:${option.name()}`);
              }
              activeVariadicOption = option.variadic ? option : null;
              continue;
            }
          }
          if (arg.length > 2 && arg[0] === "-" && arg[1] !== "-") {
            const option = this._findOption(`-${arg[1]}`);
            if (option) {
              if (option.required || option.optional && this._combineFlagAndOptionalValue) {
                this.emit(`option:${option.name()}`, arg.slice(2));
              } else {
                this.emit(`option:${option.name()}`);
                args.unshift(`-${arg.slice(2)}`);
              }
              continue;
            }
          }
          if (/^--[^=]+=/.test(arg)) {
            const index = arg.indexOf("=");
            const option = this._findOption(arg.slice(0, index));
            if (option && (option.required || option.optional)) {
              this.emit(`option:${option.name()}`, arg.slice(index + 1));
              continue;
            }
          }
          if (maybeOption(arg)) {
            dest = unknown;
          }
          if ((this._enablePositionalOptions || this._passThroughOptions) && operands.length === 0 && unknown.length === 0) {
            if (this._findCommand(arg)) {
              operands.push(arg);
              if (args.length > 0)
                unknown.push(...args);
              break;
            } else if (this._getHelpCommand() && arg === this._getHelpCommand().name()) {
              operands.push(arg);
              if (args.length > 0)
                operands.push(...args);
              break;
            } else if (this._defaultCommandName) {
              unknown.push(arg);
              if (args.length > 0)
                unknown.push(...args);
              break;
            }
          }
          if (this._passThroughOptions) {
            dest.push(arg);
            if (args.length > 0)
              dest.push(...args);
            break;
          }
          dest.push(arg);
        }
        return { operands, unknown };
      }
      /**
       * Return an object containing local option values as key-value pairs.
       *
       * @return {object}
       */
      opts() {
        if (this._storeOptionsAsProperties) {
          const result = {};
          const len = this.options.length;
          for (let i = 0; i < len; i++) {
            const key = this.options[i].attributeName();
            result[key] = key === this._versionOptionName ? this._version : this[key];
          }
          return result;
        }
        return this._optionValues;
      }
      /**
       * Return an object containing merged local and global option values as key-value pairs.
       *
       * @return {object}
       */
      optsWithGlobals() {
        return this._getCommandAndAncestors().reduce(
          (combinedOptions, cmd) => Object.assign(combinedOptions, cmd.opts()),
          {}
        );
      }
      /**
       * Display error message and exit (or call exitOverride).
       *
       * @param {string} message
       * @param {object} [errorOptions]
       * @param {string} [errorOptions.code] - an id string representing the error
       * @param {number} [errorOptions.exitCode] - used with process.exit
       */
      error(message, errorOptions) {
        this._outputConfiguration.outputError(
          `${message}
`,
          this._outputConfiguration.writeErr
        );
        if (typeof this._showHelpAfterError === "string") {
          this._outputConfiguration.writeErr(`${this._showHelpAfterError}
`);
        } else if (this._showHelpAfterError) {
          this._outputConfiguration.writeErr("\n");
          this.outputHelp({ error: true });
        }
        const config = errorOptions || {};
        const exitCode = config.exitCode || 1;
        const code = config.code || "commander.error";
        this._exit(exitCode, code, message);
      }
      /**
       * Apply any option related environment variables, if option does
       * not have a value from cli or client code.
       *
       * @private
       */
      _parseOptionsEnv() {
        this.options.forEach((option) => {
          if (option.envVar && option.envVar in process2.env) {
            const optionKey = option.attributeName();
            if (this.getOptionValue(optionKey) === void 0 || ["default", "config", "env"].includes(
              this.getOptionValueSource(optionKey)
            )) {
              if (option.required || option.optional) {
                this.emit(`optionEnv:${option.name()}`, process2.env[option.envVar]);
              } else {
                this.emit(`optionEnv:${option.name()}`);
              }
            }
          }
        });
      }
      /**
       * Apply any implied option values, if option is undefined or default value.
       *
       * @private
       */
      _parseOptionsImplied() {
        const dualHelper = new DualOptions(this.options);
        const hasCustomOptionValue = (optionKey) => {
          return this.getOptionValue(optionKey) !== void 0 && !["default", "implied"].includes(this.getOptionValueSource(optionKey));
        };
        this.options.filter(
          (option) => option.implied !== void 0 && hasCustomOptionValue(option.attributeName()) && dualHelper.valueFromOption(
            this.getOptionValue(option.attributeName()),
            option
          )
        ).forEach((option) => {
          Object.keys(option.implied).filter((impliedKey) => !hasCustomOptionValue(impliedKey)).forEach((impliedKey) => {
            this.setOptionValueWithSource(
              impliedKey,
              option.implied[impliedKey],
              "implied"
            );
          });
        });
      }
      /**
       * Argument `name` is missing.
       *
       * @param {string} name
       * @private
       */
      missingArgument(name) {
        const message = `error: missing required argument '${name}'`;
        this.error(message, { code: "commander.missingArgument" });
      }
      /**
       * `Option` is missing an argument.
       *
       * @param {Option} option
       * @private
       */
      optionMissingArgument(option) {
        const message = `error: option '${option.flags}' argument missing`;
        this.error(message, { code: "commander.optionMissingArgument" });
      }
      /**
       * `Option` does not have a value, and is a mandatory option.
       *
       * @param {Option} option
       * @private
       */
      missingMandatoryOptionValue(option) {
        const message = `error: required option '${option.flags}' not specified`;
        this.error(message, { code: "commander.missingMandatoryOptionValue" });
      }
      /**
       * `Option` conflicts with another option.
       *
       * @param {Option} option
       * @param {Option} conflictingOption
       * @private
       */
      _conflictingOption(option, conflictingOption) {
        const findBestOptionFromValue = (option2) => {
          const optionKey = option2.attributeName();
          const optionValue = this.getOptionValue(optionKey);
          const negativeOption = this.options.find(
            (target) => target.negate && optionKey === target.attributeName()
          );
          const positiveOption = this.options.find(
            (target) => !target.negate && optionKey === target.attributeName()
          );
          if (negativeOption && (negativeOption.presetArg === void 0 && optionValue === false || negativeOption.presetArg !== void 0 && optionValue === negativeOption.presetArg)) {
            return negativeOption;
          }
          return positiveOption || option2;
        };
        const getErrorMessage = (option2) => {
          const bestOption = findBestOptionFromValue(option2);
          const optionKey = bestOption.attributeName();
          const source = this.getOptionValueSource(optionKey);
          if (source === "env") {
            return `environment variable '${bestOption.envVar}'`;
          }
          return `option '${bestOption.flags}'`;
        };
        const message = `error: ${getErrorMessage(option)} cannot be used with ${getErrorMessage(conflictingOption)}`;
        this.error(message, { code: "commander.conflictingOption" });
      }
      /**
       * Unknown option `flag`.
       *
       * @param {string} flag
       * @private
       */
      unknownOption(flag) {
        if (this._allowUnknownOption)
          return;
        let suggestion = "";
        if (flag.startsWith("--") && this._showSuggestionAfterError) {
          let candidateFlags = [];
          let command = this;
          do {
            const moreFlags = command.createHelp().visibleOptions(command).filter((option) => option.long).map((option) => option.long);
            candidateFlags = candidateFlags.concat(moreFlags);
            command = command.parent;
          } while (command && !command._enablePositionalOptions);
          suggestion = suggestSimilar(flag, candidateFlags);
        }
        const message = `error: unknown option '${flag}'${suggestion}`;
        this.error(message, { code: "commander.unknownOption" });
      }
      /**
       * Excess arguments, more than expected.
       *
       * @param {string[]} receivedArgs
       * @private
       */
      _excessArguments(receivedArgs) {
        if (this._allowExcessArguments)
          return;
        const expected = this.registeredArguments.length;
        const s = expected === 1 ? "" : "s";
        const forSubcommand = this.parent ? ` for '${this.name()}'` : "";
        const message = `error: too many arguments${forSubcommand}. Expected ${expected} argument${s} but got ${receivedArgs.length}.`;
        this.error(message, { code: "commander.excessArguments" });
      }
      /**
       * Unknown command.
       *
       * @private
       */
      unknownCommand() {
        const unknownName = this.args[0];
        let suggestion = "";
        if (this._showSuggestionAfterError) {
          const candidateNames = [];
          this.createHelp().visibleCommands(this).forEach((command) => {
            candidateNames.push(command.name());
            if (command.alias())
              candidateNames.push(command.alias());
          });
          suggestion = suggestSimilar(unknownName, candidateNames);
        }
        const message = `error: unknown command '${unknownName}'${suggestion}`;
        this.error(message, { code: "commander.unknownCommand" });
      }
      /**
       * Get or set the program version.
       *
       * This method auto-registers the "-V, --version" option which will print the version number.
       *
       * You can optionally supply the flags and description to override the defaults.
       *
       * @param {string} [str]
       * @param {string} [flags]
       * @param {string} [description]
       * @return {(this | string | undefined)} `this` command for chaining, or version string if no arguments
       */
      version(str, flags, description) {
        if (str === void 0)
          return this._version;
        this._version = str;
        flags = flags || "-V, --version";
        description = description || "output the version number";
        const versionOption = this.createOption(flags, description);
        this._versionOptionName = versionOption.attributeName();
        this._registerOption(versionOption);
        this.on("option:" + versionOption.name(), () => {
          this._outputConfiguration.writeOut(`${str}
`);
          this._exit(0, "commander.version", str);
        });
        return this;
      }
      /**
       * Set the description.
       *
       * @param {string} [str]
       * @param {object} [argsDescription]
       * @return {(string|Command)}
       */
      description(str, argsDescription) {
        if (str === void 0 && argsDescription === void 0)
          return this._description;
        this._description = str;
        if (argsDescription) {
          this._argsDescription = argsDescription;
        }
        return this;
      }
      /**
       * Set the summary. Used when listed as subcommand of parent.
       *
       * @param {string} [str]
       * @return {(string|Command)}
       */
      summary(str) {
        if (str === void 0)
          return this._summary;
        this._summary = str;
        return this;
      }
      /**
       * Set an alias for the command.
       *
       * You may call more than once to add multiple aliases. Only the first alias is shown in the auto-generated help.
       *
       * @param {string} [alias]
       * @return {(string|Command)}
       */
      alias(alias) {
        if (alias === void 0)
          return this._aliases[0];
        let command = this;
        if (this.commands.length !== 0 && this.commands[this.commands.length - 1]._executableHandler) {
          command = this.commands[this.commands.length - 1];
        }
        if (alias === command._name)
          throw new Error("Command alias can't be the same as its name");
        const matchingCommand = this.parent?._findCommand(alias);
        if (matchingCommand) {
          const existingCmd = [matchingCommand.name()].concat(matchingCommand.aliases()).join("|");
          throw new Error(
            `cannot add alias '${alias}' to command '${this.name()}' as already have command '${existingCmd}'`
          );
        }
        command._aliases.push(alias);
        return this;
      }
      /**
       * Set aliases for the command.
       *
       * Only the first alias is shown in the auto-generated help.
       *
       * @param {string[]} [aliases]
       * @return {(string[]|Command)}
       */
      aliases(aliases) {
        if (aliases === void 0)
          return this._aliases;
        aliases.forEach((alias) => this.alias(alias));
        return this;
      }
      /**
       * Set / get the command usage `str`.
       *
       * @param {string} [str]
       * @return {(string|Command)}
       */
      usage(str) {
        if (str === void 0) {
          if (this._usage)
            return this._usage;
          const args = this.registeredArguments.map((arg) => {
            return humanReadableArgName(arg);
          });
          return [].concat(
            this.options.length || this._helpOption !== null ? "[options]" : [],
            this.commands.length ? "[command]" : [],
            this.registeredArguments.length ? args : []
          ).join(" ");
        }
        this._usage = str;
        return this;
      }
      /**
       * Get or set the name of the command.
       *
       * @param {string} [str]
       * @return {(string|Command)}
       */
      name(str) {
        if (str === void 0)
          return this._name;
        this._name = str;
        return this;
      }
      /**
       * Set the name of the command from script filename, such as process.argv[1],
       * or require.main.filename, or __filename.
       *
       * (Used internally and public although not documented in README.)
       *
       * @example
       * program.nameFromFilename(require.main.filename);
       *
       * @param {string} filename
       * @return {Command}
       */
      nameFromFilename(filename) {
        this._name = path.basename(filename, path.extname(filename));
        return this;
      }
      /**
       * Get or set the directory for searching for executable subcommands of this command.
       *
       * @example
       * program.executableDir(__dirname);
       * // or
       * program.executableDir('subcommands');
       *
       * @param {string} [path]
       * @return {(string|null|Command)}
       */
      executableDir(path2) {
        if (path2 === void 0)
          return this._executableDir;
        this._executableDir = path2;
        return this;
      }
      /**
       * Return program help documentation.
       *
       * @param {{ error: boolean }} [contextOptions] - pass {error:true} to wrap for stderr instead of stdout
       * @return {string}
       */
      helpInformation(contextOptions) {
        const helper = this.createHelp();
        if (helper.helpWidth === void 0) {
          helper.helpWidth = contextOptions && contextOptions.error ? this._outputConfiguration.getErrHelpWidth() : this._outputConfiguration.getOutHelpWidth();
        }
        return helper.formatHelp(this, helper);
      }
      /**
       * @private
       */
      _getHelpContext(contextOptions) {
        contextOptions = contextOptions || {};
        const context = { error: !!contextOptions.error };
        let write;
        if (context.error) {
          write = (arg) => this._outputConfiguration.writeErr(arg);
        } else {
          write = (arg) => this._outputConfiguration.writeOut(arg);
        }
        context.write = contextOptions.write || write;
        context.command = this;
        return context;
      }
      /**
       * Output help information for this command.
       *
       * Outputs built-in help, and custom text added using `.addHelpText()`.
       *
       * @param {{ error: boolean } | Function} [contextOptions] - pass {error:true} to write to stderr instead of stdout
       */
      outputHelp(contextOptions) {
        let deprecatedCallback;
        if (typeof contextOptions === "function") {
          deprecatedCallback = contextOptions;
          contextOptions = void 0;
        }
        const context = this._getHelpContext(contextOptions);
        this._getCommandAndAncestors().reverse().forEach((command) => command.emit("beforeAllHelp", context));
        this.emit("beforeHelp", context);
        let helpInformation = this.helpInformation(context);
        if (deprecatedCallback) {
          helpInformation = deprecatedCallback(helpInformation);
          if (typeof helpInformation !== "string" && !Buffer.isBuffer(helpInformation)) {
            throw new Error("outputHelp callback must return a string or a Buffer");
          }
        }
        context.write(helpInformation);
        if (this._getHelpOption()?.long) {
          this.emit(this._getHelpOption().long);
        }
        this.emit("afterHelp", context);
        this._getCommandAndAncestors().forEach(
          (command) => command.emit("afterAllHelp", context)
        );
      }
      /**
       * You can pass in flags and a description to customise the built-in help option.
       * Pass in false to disable the built-in help option.
       *
       * @example
       * program.helpOption('-?, --help' 'show help'); // customise
       * program.helpOption(false); // disable
       *
       * @param {(string | boolean)} flags
       * @param {string} [description]
       * @return {Command} `this` command for chaining
       */
      helpOption(flags, description) {
        if (typeof flags === "boolean") {
          if (flags) {
            this._helpOption = this._helpOption ?? void 0;
          } else {
            this._helpOption = null;
          }
          return this;
        }
        flags = flags ?? "-h, --help";
        description = description ?? "display help for command";
        this._helpOption = this.createOption(flags, description);
        return this;
      }
      /**
       * Lazy create help option.
       * Returns null if has been disabled with .helpOption(false).
       *
       * @returns {(Option | null)} the help option
       * @package
       */
      _getHelpOption() {
        if (this._helpOption === void 0) {
          this.helpOption(void 0, void 0);
        }
        return this._helpOption;
      }
      /**
       * Supply your own option to use for the built-in help option.
       * This is an alternative to using helpOption() to customise the flags and description etc.
       *
       * @param {Option} option
       * @return {Command} `this` command for chaining
       */
      addHelpOption(option) {
        this._helpOption = option;
        return this;
      }
      /**
       * Output help information and exit.
       *
       * Outputs built-in help, and custom text added using `.addHelpText()`.
       *
       * @param {{ error: boolean }} [contextOptions] - pass {error:true} to write to stderr instead of stdout
       */
      help(contextOptions) {
        this.outputHelp(contextOptions);
        let exitCode = process2.exitCode || 0;
        if (exitCode === 0 && contextOptions && typeof contextOptions !== "function" && contextOptions.error) {
          exitCode = 1;
        }
        this._exit(exitCode, "commander.help", "(outputHelp)");
      }
      /**
       * Add additional text to be displayed with the built-in help.
       *
       * Position is 'before' or 'after' to affect just this command,
       * and 'beforeAll' or 'afterAll' to affect this command and all its subcommands.
       *
       * @param {string} position - before or after built-in help
       * @param {(string | Function)} text - string to add, or a function returning a string
       * @return {Command} `this` command for chaining
       */
      addHelpText(position, text) {
        const allowedValues = ["beforeAll", "before", "after", "afterAll"];
        if (!allowedValues.includes(position)) {
          throw new Error(`Unexpected value for position to addHelpText.
Expecting one of '${allowedValues.join("', '")}'`);
        }
        const helpEvent = `${position}Help`;
        this.on(helpEvent, (context) => {
          let helpStr;
          if (typeof text === "function") {
            helpStr = text({ error: context.error, command: context.command });
          } else {
            helpStr = text;
          }
          if (helpStr) {
            context.write(`${helpStr}
`);
          }
        });
        return this;
      }
      /**
       * Output help information if help flags specified
       *
       * @param {Array} args - array of options to search for help flags
       * @private
       */
      _outputHelpIfRequested(args) {
        const helpOption = this._getHelpOption();
        const helpRequested = helpOption && args.find((arg) => helpOption.is(arg));
        if (helpRequested) {
          this.outputHelp();
          this._exit(0, "commander.helpDisplayed", "(outputHelp)");
        }
      }
    };
    function incrementNodeInspectorPort(args) {
      return args.map((arg) => {
        if (!arg.startsWith("--inspect")) {
          return arg;
        }
        let debugOption;
        let debugHost = "127.0.0.1";
        let debugPort = "9229";
        let match;
        if ((match = arg.match(/^(--inspect(-brk)?)$/)) !== null) {
          debugOption = match[1];
        } else if ((match = arg.match(/^(--inspect(-brk|-port)?)=([^:]+)$/)) !== null) {
          debugOption = match[1];
          if (/^\d+$/.test(match[3])) {
            debugPort = match[3];
          } else {
            debugHost = match[3];
          }
        } else if ((match = arg.match(/^(--inspect(-brk|-port)?)=([^:]+):(\d+)$/)) !== null) {
          debugOption = match[1];
          debugHost = match[3];
          debugPort = match[4];
        }
        if (debugOption && debugPort !== "0") {
          return `${debugOption}=${debugHost}:${parseInt(debugPort) + 1}`;
        }
        return arg;
      });
    }
    exports2.Command = Command2;
  }
});

// ../../../../../../../plugins/gitlab/infra/gitlab-action/node_modules/.pnpm/commander@12.1.0/node_modules/commander/index.js
var require_commander = __commonJS({
  "../../../../../../../plugins/gitlab/infra/gitlab-action/node_modules/.pnpm/commander@12.1.0/node_modules/commander/index.js"(exports2) {
    var { Argument: Argument2 } = require_argument();
    var { Command: Command2 } = require_command();
    var { CommanderError: CommanderError2, InvalidArgumentError: InvalidArgumentError2 } = require_error();
    var { Help: Help2 } = require_help();
    var { Option: Option2 } = require_option();
    exports2.program = new Command2();
    exports2.createCommand = (name) => new Command2(name);
    exports2.createOption = (flags, description) => new Option2(flags, description);
    exports2.createArgument = (name, description) => new Argument2(name, description);
    exports2.Command = Command2;
    exports2.Option = Option2;
    exports2.Argument = Argument2;
    exports2.Help = Help2;
    exports2.CommanderError = CommanderError2;
    exports2.InvalidArgumentError = InvalidArgumentError2;
    exports2.InvalidOptionArgumentError = InvalidArgumentError2;
  }
});

// ../../../../../../../plugins/gitlab/infra/gitlab-action/node_modules/.pnpm/commander@12.1.0/node_modules/commander/esm.mjs
var import_index = __toESM(require_commander(), 1);
var {
  program,
  createCommand,
  createArgument,
  createOption,
  CommanderError,
  InvalidArgumentError,
  InvalidOptionArgumentError,
  // deprecated old name
  Command,
  Argument,
  Option,
  Help
} = import_index.default;

// ../../../../../../../plugins/gitlab/infra/gitlab-action/node_modules/.pnpm/@vecode-fe+nextbeaker-api@1.2.2/node_modules/@vecode-fe/nextbeaker-api/dist/index.js
var __defProp2 = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp2(target, name, { get: all[name], enumerable: true });
};
var account_exports = {};
__export(account_exports, {
  Layout: () => Layout,
  ThemeMode: () => ThemeMode,
  TimeDisplayMode: () => TimeDisplayMode,
  UserStatus: () => UserStatus,
  UserType: () => UserType
});
var Layout = /* @__PURE__ */ ((Layout2) => {
  Layout2["LayoutFixed"] = "fixed";
  Layout2["LayoutFluid"] = "fluid";
  return Layout2;
})(Layout || {});
var ThemeMode = /* @__PURE__ */ ((ThemeMode2) => {
  ThemeMode2["ThemeModeAuto"] = "auto";
  ThemeMode2["ThemeModeDark"] = "dark";
  ThemeMode2["ThemeModeLight"] = "light";
  return ThemeMode2;
})(ThemeMode || {});
var TimeDisplayMode = /* @__PURE__ */ ((TimeDisplayMode2) => {
  TimeDisplayMode2["TimeDisplayModeAbsolute"] = "absolute";
  TimeDisplayMode2["TimeDisplayModeRelative"] = "relative";
  return TimeDisplayMode2;
})(TimeDisplayMode || {});
var UserStatus = /* @__PURE__ */ ((UserStatus2) => {
  UserStatus2["UserStatusActive"] = "active";
  UserStatus2["UserStatusBlocked"] = "blocked";
  return UserStatus2;
})(UserStatus || {});
var UserType = /* @__PURE__ */ ((UserType2) => {
  UserType2["UserTypeApp"] = "app";
  UserType2["UserTypePersonal"] = "personal";
  return UserType2;
})(UserType || {});
var check_run_exports = {};
__export(check_run_exports, {
  Conclusion: () => Conclusion,
  DisplayMode: () => DisplayMode,
  Level: () => Level,
  Status: () => Status,
  SummaryStatus: () => SummaryStatus
});
var Conclusion = /* @__PURE__ */ ((Conclusion2) => {
  Conclusion2["ConclusionCanceled"] = "canceled";
  Conclusion2["ConclusionFailed"] = "failed";
  Conclusion2["ConclusionNeutral"] = "neutral";
  Conclusion2["ConclusionOperationRequired"] = "operation_required";
  Conclusion2["ConclusionSucceeded"] = "succeeded";
  Conclusion2["ConclusionTimedOut"] = "timed_out";
  Conclusion2["ConclusionWarning"] = "warning";
  return Conclusion2;
})(Conclusion || {});
var DisplayMode = /* @__PURE__ */ ((DisplayMode2) => {
  DisplayMode2["DisplayModeDefault"] = "default";
  DisplayMode2["DisplayModeHidden"] = "hidden";
  DisplayMode2["DisplayModeHighlighted"] = "highlighted";
  return DisplayMode2;
})(DisplayMode || {});
var Level = /* @__PURE__ */ ((Level2) => {
  Level2["LevelCritical"] = "critical";
  Level2["LevelError"] = "error";
  Level2["LevelInfo"] = "info";
  Level2["LevelWarning"] = "warning";
  return Level2;
})(Level || {});
var Status = /* @__PURE__ */ ((Status8) => {
  Status8["StatusCompleted"] = "completed";
  Status8["StatusInProgress"] = "in_progress";
  Status8["StatusQueued"] = "queued";
  return Status8;
})(Status || {});
var SummaryStatus = /* @__PURE__ */ ((SummaryStatus2) => {
  SummaryStatus2["SummaryStatusFailed"] = "failed";
  SummaryStatus2["SummaryStatusPassed"] = "passed";
  SummaryStatus2["SummaryStatusPending"] = "pending";
  return SummaryStatus2;
})(SummaryStatus || {});
var comment_exports = {};
__export(comment_exports, {
  CommentableType: () => CommentableType,
  DiffSide: () => DiffSide,
  DiffType: () => DiffType,
  Status: () => Status2
});
var CommentableType = /* @__PURE__ */ ((CommentableType2) => {
  CommentableType2["CommentableTypeCommit"] = "commit";
  CommentableType2["CommentableTypeIssue"] = "issue";
  CommentableType2["CommentableTypeMergeRequest"] = "merge_request";
  return CommentableType2;
})(CommentableType || {});
var DiffSide = /* @__PURE__ */ ((DiffSide2) => {
  DiffSide2["DiffSideNew"] = "new";
  DiffSide2["DiffSideOld"] = "old";
  return DiffSide2;
})(DiffSide || {});
var DiffType = /* @__PURE__ */ ((DiffType2) => {
  DiffType2["DiffTypeCommit"] = "commit";
  DiffType2["DiffTypeContent"] = "content";
  DiffType2["DiffTypeFile"] = "file";
  return DiffType2;
})(DiffType || {});
var Status2 = /* @__PURE__ */ ((Status8) => {
  Status8["StatusClosed"] = "closed";
  Status8["StatusOpen"] = "open";
  Status8["StatusResolved"] = "resolved";
  return Status8;
})(Status2 || {});
var copilot_exports = {};
__export(copilot_exports, {
  BuiltinToolType: () => BuiltinToolType,
  CommandStatus: () => CommandStatus,
  EventType: () => EventType,
  HookEventType: () => HookEventType,
  HookType: () => HookType,
  MCPTransportType: () => MCPTransportType,
  Method: () => Method,
  Mode: () => Mode,
  Role: () => Role,
  Runtime: () => Runtime,
  SessionStatus: () => SessionStatus,
  TaskStatus: () => TaskStatus,
  TodoPriority: () => TodoPriority,
  TodoStatus: () => TodoStatus
});
var BuiltinToolType = /* @__PURE__ */ ((BuiltinToolType2) => {
  BuiltinToolType2["BuiltinToolTypeAuth"] = "auth";
  BuiltinToolType2["BuiltinToolTypeBash"] = "bash";
  BuiltinToolType2["BuiltinToolTypeBashOutput"] = "bash_output";
  BuiltinToolType2["BuiltinToolTypeEdit"] = "edit";
  BuiltinToolType2["BuiltinToolTypeGlob"] = "glob";
  BuiltinToolType2["BuiltinToolTypeGrep"] = "grep";
  BuiltinToolType2["BuiltinToolTypeKillShell"] = "kill_shell";
  BuiltinToolType2["BuiltinToolTypeLs"] = "ls";
  BuiltinToolType2["BuiltinToolTypeMultiEdit"] = "multi_edit";
  BuiltinToolType2["BuiltinToolTypeRead"] = "read";
  BuiltinToolType2["BuiltinToolTypeSearch"] = "search";
  BuiltinToolType2["BuiltinToolTypeSessionStateUpdate"] = "session_state_update";
  BuiltinToolType2["BuiltinToolTypeSessionStatusUpdate"] = "session_status_update";
  BuiltinToolType2["BuiltinToolTypeTask"] = "task";
  BuiltinToolType2["BuiltinToolTypeThink"] = "think";
  BuiltinToolType2["BuiltinToolTypeTodoWrite"] = "todo_write";
  BuiltinToolType2["BuiltinToolTypeWrite"] = "write";
  return BuiltinToolType2;
})(BuiltinToolType || {});
var CommandStatus = /* @__PURE__ */ ((CommandStatus2) => {
  CommandStatus2["CommandStatusCompleted"] = "completed";
  CommandStatus2["CommandStatusFailed"] = "failed";
  CommandStatus2["CommandStatusKilled"] = "killed";
  CommandStatus2["CommandStatusRunning"] = "running";
  return CommandStatus2;
})(CommandStatus || {});
var EventType = /* @__PURE__ */ ((EventType3) => {
  EventType3["EventTypeBuiltinToolCall"] = "builtin_tool_call";
  EventType3["EventTypeBuiltinToolCallOutput"] = "builtin_tool_call_output";
  EventType3["EventTypeFullMessage"] = "full_message";
  EventType3["EventTypeMCPToolCall"] = "mcp_tool_call";
  EventType3["EventTypeMCPToolCallOutput"] = "mcp_tool_call_output";
  EventType3["EventTypePartialBuiltinToolCall"] = "partial_builtin_tool_call";
  EventType3["EventTypePartialMessage"] = "partial_message";
  EventType3["EventTypeTaskStateUpdate"] = "task_state_update";
  EventType3["EventTypeTaskStatusUpdate"] = "task_status_update";
  EventType3["EventTypeUnknownToolCall"] = "unknown_tool_call";
  return EventType3;
})(EventType || {});
var HookEventType = /* @__PURE__ */ ((HookEventType2) => {
  HookEventType2["HookEventTypePostToolUse"] = "post_tool_use";
  HookEventType2["HookEventTypeStop"] = "stop";
  HookEventType2["HookEventTypeSubagentStop"] = "subagent_stop";
  HookEventType2["HookEventTypeUserPromptSubmit"] = "user_prompt_submit";
  return HookEventType2;
})(HookEventType || {});
var HookType = /* @__PURE__ */ ((HookType2) => {
  HookType2["HookTypeCommand"] = "command";
  return HookType2;
})(HookType || {});
var MCPTransportType = /* @__PURE__ */ ((MCPTransportType2) => {
  MCPTransportType2["MCPTransportTypeHTTP"] = "http";
  MCPTransportType2["MCPTransportTypeSSE"] = "sse";
  MCPTransportType2["MCPTransportTypeSTDIO"] = "stdio";
  return MCPTransportType2;
})(MCPTransportType || {});
var Method = /* @__PURE__ */ ((Method2) => {
  Method2["MethodExtSessionDelete"] = "_ext/session/delete";
  Method2["MethodExtSessionGet"] = "_ext/session/get";
  Method2["MethodExtSessionList"] = "_ext/session/list";
  Method2["MethodExtSessionRequestPermissionResponse"] = "_ext/session/request_permission_response";
  Method2["MethodSessionCancel"] = "session/cancel";
  Method2["MethodSessionDelete"] = "session/delete";
  Method2["MethodSessionGet"] = "session/get";
  Method2["MethodSessionList"] = "session/list";
  Method2["MethodSessionNew"] = "session/new";
  Method2["MethodSessionPrompt"] = "session/prompt";
  Method2["MethodSessionRequestPermission"] = "session/request_permission";
  Method2["MethodSessionUpdate"] = "session/update";
  return Method2;
})(Method || {});
var Mode = /* @__PURE__ */ ((Mode2) => {
  Mode2["ModeBypassPermissions"] = "bypass_permissions";
  Mode2["ModeDefault"] = "default";
  Mode2["ModePlan"] = "plan";
  return Mode2;
})(Mode || {});
var Role = /* @__PURE__ */ ((Role2) => {
  Role2["RoleAgent"] = "agent";
  Role2["RoleUser"] = "user";
  return Role2;
})(Role || {});
var Runtime = /* @__PURE__ */ ((Runtime2) => {
  Runtime2["RuntimeCloud"] = "cloud";
  Runtime2["RuntimeLocal"] = "local";
  return Runtime2;
})(Runtime || {});
var SessionStatus = /* @__PURE__ */ ((SessionStatus2) => {
  SessionStatus2["SessionStatusAuthRequired"] = "auth_required";
  SessionStatus2["SessionStatusCanceled"] = "canceled";
  SessionStatus2["SessionStatusCompleted"] = "completed";
  SessionStatus2["SessionStatusFailed"] = "failed";
  SessionStatus2["SessionStatusInputRequired"] = "input_required";
  SessionStatus2["SessionStatusSubmitted"] = "submitted";
  SessionStatus2["SessionStatusWorking"] = "working";
  return SessionStatus2;
})(SessionStatus || {});
var TaskStatus = /* @__PURE__ */ ((TaskStatus2) => {
  TaskStatus2["TaskStatusAuthRequired"] = "auth_required";
  TaskStatus2["TaskStatusCanceled"] = "canceled";
  TaskStatus2["TaskStatusCompleted"] = "completed";
  TaskStatus2["TaskStatusFailed"] = "failed";
  TaskStatus2["TaskStatusInputRequired"] = "input_required";
  TaskStatus2["TaskStatusSubmitted"] = "submitted";
  TaskStatus2["TaskStatusWorking"] = "working";
  return TaskStatus2;
})(TaskStatus || {});
var TodoPriority = /* @__PURE__ */ ((TodoPriority2) => {
  TodoPriority2["TodoPriorityHigh"] = "high";
  TodoPriority2["TodoPriorityLow"] = "low";
  TodoPriority2["TodoPriorityMedium"] = "medium";
  return TodoPriority2;
})(TodoPriority || {});
var TodoStatus = /* @__PURE__ */ ((TodoStatus2) => {
  TodoStatus2["TodoStatusCompleted"] = "completed";
  TodoStatus2["TodoStatusInProgress"] = "in_progress";
  TodoStatus2["TodoStatusPending"] = "pending";
  return TodoStatus2;
})(TodoStatus || {});
var environment_exports = {};
__export(environment_exports, {
  ScriptType: () => ScriptType
});
var ScriptType = /* @__PURE__ */ ((ScriptType2) => {
  ScriptType2[ScriptType2["UNSPECIFIED"] = 0] = "UNSPECIFIED";
  ScriptType2[ScriptType2["SETUP"] = 1] = "SETUP";
  ScriptType2[ScriptType2["MAINTENANCE"] = 2] = "MAINTENANCE";
  return ScriptType2;
})(ScriptType || {});
var issue_exports = {};
__export(issue_exports, {
  Status: () => Status3
});
var Status3 = /* @__PURE__ */ ((Status8) => {
  Status8["StatusBacklog"] = "backlog";
  Status8["StatusCanceled"] = "canceled";
  Status8["StatusDone"] = "done";
  Status8["StatusInProgress"] = "in_progress";
  Status8["StatusTodo"] = "todo";
  return Status8;
})(Status3 || {});
var merge_queue_exports = {};
__export(merge_queue_exports, {
  DequeuedReason: () => DequeuedReason,
  Status: () => Status4
});
var DequeuedReason = /* @__PURE__ */ ((DequeuedReason2) => {
  DequeuedReason2["DequeuedReasonManual"] = "manual";
  DequeuedReason2["DequeuedReasonMerged"] = "merged";
  DequeuedReason2["DequeuedReasonUnmergeable"] = "unmergeable";
  return DequeuedReason2;
})(DequeuedReason || {});
var Status4 = /* @__PURE__ */ ((Status8) => {
  Status8["StatusCheckPending"] = "check_pending";
  Status8["StatusCheckRunning"] = "check_running";
  Status8["StatusDequeued"] = "dequeued";
  Status8["StatusMergeable"] = "mergeable";
  Status8["StatusQueued"] = "queued";
  Status8["StatusUnmergeable"] = "unmergeable";
  return Status8;
})(Status4 || {});
var merge_request_exports = {};
__export(merge_request_exports, {
  BypassReason: () => BypassReason,
  ChangeMode: () => ChangeMode,
  ConflictsUnresolvableReason: () => ConflictsUnresolvableReason,
  MergeMethod: () => MergeMethod,
  Status: () => Status5,
  UnmergeableReason: () => UnmergeableReason,
  VersionType: () => VersionType
});
var BypassReason = /* @__PURE__ */ ((BypassReason2) => {
  BypassReason2["BypassReasonEmergency"] = "emergency";
  BypassReason2["BypassReasonInaccurateConclusion"] = "inaccurate_conclusion";
  BypassReason2["BypassReasonNoAvailableReviewer"] = "no_available_reviewer";
  BypassReason2["BypassReasonNoNeedForReview"] = "no_need_for_review";
  BypassReason2["BypassReasonNoResponse"] = "no_response";
  BypassReason2["BypassReasonOther"] = "other";
  return BypassReason2;
})(BypassReason || {});
var ChangeMode = /* @__PURE__ */ ((ChangeMode2) => {
  ChangeMode2["ChangeModeBranch"] = "branch";
  ChangeMode2["ChangeModeCommit"] = "commit";
  ChangeMode2["ChangeModeMultiCommits"] = "multi_commits";
  return ChangeMode2;
})(ChangeMode || {});
var ConflictsUnresolvableReason = /* @__PURE__ */ ((ConflictsUnresolvableReason2) => {
  ConflictsUnresolvableReason2["ConflictsUnresolvableReasonMergeRequestNotOpen"] = "merge_request_not_open";
  ConflictsUnresolvableReason2["ConflictsUnresolvableReasonNoConflicts"] = "no_conflicts";
  ConflictsUnresolvableReason2["ConflictsUnresolvableReasonNoPermission"] = "no_permission";
  ConflictsUnresolvableReason2["ConflictsUnresolvableReasonUnrepresentableInUI"] = "unrepresentable_in_ui";
  ConflictsUnresolvableReason2["ConflictsUnresolvableReasonUnsupportedMergeMethod"] = "unsupported_merge_method";
  return ConflictsUnresolvableReason2;
})(ConflictsUnresolvableReason || {});
var MergeMethod = /* @__PURE__ */ ((MergeMethod2) => {
  MergeMethod2["MergeMethodMergeCommit"] = "merge_commit";
  MergeMethod2["MergeMethodMergeCommitWithSemiLinearHistory"] = "merge_commit_with_semi_linear_history";
  MergeMethod2["MergeMethodRebaseMerge"] = "rebase_merge";
  return MergeMethod2;
})(MergeMethod || {});
var Status5 = /* @__PURE__ */ ((Status8) => {
  Status8["StatusClosed"] = "closed";
  Status8["StatusMerged"] = "merged";
  Status8["StatusOpen"] = "open";
  return Status8;
})(Status5 || {});
var UnmergeableReason = /* @__PURE__ */ ((UnmergeableReason2) => {
  UnmergeableReason2["UnmergeableReasonBranchMissing"] = "branch_missing";
  UnmergeableReason2["UnmergeableReasonBranchProtected"] = "branch_protected";
  UnmergeableReason2["UnmergeableReasonChecksFailed"] = "checks_failed";
  UnmergeableReason2["UnmergeableReasonChecksPending"] = "checks_pending";
  UnmergeableReason2["UnmergeableReasonChecksTimedOut"] = "checks_timed_out";
  UnmergeableReason2["UnmergeableReasonClosed"] = "closed";
  UnmergeableReason2["UnmergeableReasonConflict"] = "conflict";
  UnmergeableReason2["UnmergeableReasonDependencyUnmergeable"] = "dependency_unmergeable";
  UnmergeableReason2["UnmergeableReasonDraft"] = "draft";
  UnmergeableReason2["UnmergeableReasonMergeQueueRequired"] = "merge_queue_required";
  UnmergeableReason2["UnmergeableReasonMerged"] = "merged";
  UnmergeableReason2["UnmergeableReasonNoCommits"] = "no_commits";
  UnmergeableReason2["UnmergeableReasonRebaseNeeded"] = "rebase_needed";
  UnmergeableReason2["UnmergeableReasonRepoArchived"] = "repo_archived";
  UnmergeableReason2["UnmergeableReasonReviewNotPassed"] = "review_not_passed";
  UnmergeableReason2["UnmergeableReasonSHAMismatch"] = "sha_mismatch";
  UnmergeableReason2["UnmergeableReasonThreadUnresolved"] = "thread_unresolved";
  UnmergeableReason2["UnmergeableReasonWIP"] = "wip";
  UnmergeableReason2["UnmergeableReasonWorkItemLinkNeeded"] = "work_item_link_needed";
  return UnmergeableReason2;
})(UnmergeableReason || {});
var VersionType = /* @__PURE__ */ ((VersionType2) => {
  VersionType2["VersionTypeMergeFirstParentUpdate"] = "merge_first_parent_update";
  VersionType2["VersionTypeNoChange"] = "no_change";
  VersionType2["VersionTypeNoCodeChange"] = "no_code_change";
  VersionType2["VersionTypeRework"] = "rework";
  VersionType2["VersionTypeTrivialRebase"] = "trivial_rebase";
  return VersionType2;
})(VersionType || {});
var milestone_exports = {};
__export(milestone_exports, {
  Status: () => Status6
});
var Status6 = /* @__PURE__ */ ((Status8) => {
  Status8["StatusClosed"] = "closed";
  Status8["StatusOpen"] = "open";
  return Status8;
})(Status6 || {});
var permission_exports = {};
__export(permission_exports, {
  MemberRole: () => MemberRole
});
var MemberRole = /* @__PURE__ */ ((MemberRole2) => {
  MemberRole2["MemberRoleDeveloper"] = "developer";
  MemberRole2["MemberRoleMaster"] = "master";
  MemberRole2["MemberRoleNoAccess"] = "no_access";
  MemberRole2["MemberRoleOwner"] = "owner";
  MemberRole2["MemberRoleReporter"] = "reporter";
  return MemberRole2;
})(MemberRole || {});
var property_exports = {};
__export(property_exports, {
  Locale: () => Locale,
  PropertyType: () => PropertyType
});
var Locale = /* @__PURE__ */ ((Locale2) => {
  Locale2["LocaleEnUS"] = "en-US";
  Locale2["LocaleZhCN"] = "zh-CN";
  return Locale2;
})(Locale || {});
var PropertyType = /* @__PURE__ */ ((PropertyType2) => {
  PropertyType2["PropertyTypeList"] = "list";
  PropertyType2["PropertyTypeMarkdown"] = "markdown";
  PropertyType2["PropertyTypeText"] = "text";
  PropertyType2["PropertyTypeUser"] = "user";
  return PropertyType2;
})(PropertyType || {});
var protected_branch_exports = {};
__export(protected_branch_exports, {
  BranchAction: () => BranchAction,
  CheckStrategy: () => CheckStrategy
});
var BranchAction = /* @__PURE__ */ ((BranchAction2) => {
  BranchAction2["BranchActionBypass"] = "bypass";
  BranchAction2["BranchActionCreate"] = "create";
  BranchAction2["BranchActionDelete"] = "delete";
  BranchAction2["BranchActionForcePush"] = "force_push";
  BranchAction2["BranchActionMerge"] = "merge";
  BranchAction2["BranchActionPush"] = "push";
  return BranchAction2;
})(BranchAction || {});
var CheckStrategy = /* @__PURE__ */ ((CheckStrategy2) => {
  CheckStrategy2["CheckStrategyAllGreen"] = "all_green";
  CheckStrategy2["CheckStrategyHeadGreen"] = "head_green";
  return CheckStrategy2;
})(CheckStrategy || {});
var reaction_exports = {};
__export(reaction_exports, {
  TargetType: () => TargetType
});
var TargetType = /* @__PURE__ */ ((TargetType3) => {
  TargetType3["TargetTypeComment"] = "comment";
  return TargetType3;
})(TargetType || {});
var repository_exports = {};
__export(repository_exports, {
  RepositoryStatus: () => RepositoryStatus
});
var RepositoryStatus = /* @__PURE__ */ ((RepositoryStatus2) => {
  RepositoryStatus2["RepositoryStatusArchived"] = "archived";
  RepositoryStatus2["RepositoryStatusCreated"] = "created";
  return RepositoryStatus2;
})(RepositoryStatus || {});
var review_exports = {};
__export(review_exports, {
  ApprovalResetLevel: () => ApprovalResetLevel,
  ReviewStatusStatus: () => ReviewStatusStatus,
  ReviewSummaryStatus: () => ReviewSummaryStatus,
  Status: () => Status7
});
var ApprovalResetLevel = /* @__PURE__ */ ((ApprovalResetLevel2) => {
  ApprovalResetLevel2["ApprovalResetLevelAllowed"] = "allowed";
  ApprovalResetLevel2["ApprovalResetLevelEncouraged"] = "encouraged";
  ApprovalResetLevel2["ApprovalResetLevelNotAllowed"] = "not_allowed";
  ApprovalResetLevel2["ApprovalResetLevelRequired"] = "required";
  return ApprovalResetLevel2;
})(ApprovalResetLevel || {});
var ReviewStatusStatus = /* @__PURE__ */ ((ReviewStatusStatus2) => {
  ReviewStatusStatus2["ReviewStatusStatusDisapproved"] = "disapproved";
  ReviewStatusStatus2["ReviewStatusStatusPassed"] = "passed";
  ReviewStatusStatus2["ReviewStatusStatusPending"] = "pending";
  return ReviewStatusStatus2;
})(ReviewStatusStatus || {});
var ReviewSummaryStatus = /* @__PURE__ */ ((ReviewSummaryStatus2) => {
  ReviewSummaryStatus2["ReviewSummaryStatusDisapproved"] = "disapproved";
  ReviewSummaryStatus2["ReviewSummaryStatusPassed"] = "passed";
  ReviewSummaryStatus2["ReviewSummaryStatusPending"] = "pending";
  return ReviewSummaryStatus2;
})(ReviewSummaryStatus || {});
var Status7 = /* @__PURE__ */ ((Status8) => {
  Status8["StatusApproved"] = "approved";
  Status8["StatusCommented"] = "commented";
  Status8["StatusDisapproved"] = "disapproved";
  Status8["StatusDismissed"] = "dismissed";
  return Status8;
})(Status7 || {});
var settings_exports = {};
__export(settings_exports, {
  TargetType: () => TargetType2,
  WebhookStatus: () => WebhookStatus
});
var TargetType2 = /* @__PURE__ */ ((TargetType3) => {
  TargetType3["TargetTypeInstance"] = "instance";
  TargetType3["TargetTypeNamespace"] = "namespace";
  TargetType3["TargetTypeRepository"] = "repository";
  return TargetType3;
})(TargetType2 || {});
var WebhookStatus = /* @__PURE__ */ ((WebhookStatus2) => {
  WebhookStatus2["WebhookStatusDisabled"] = "disabled";
  WebhookStatus2["WebhookStatusEnabled"] = "enabled";
  WebhookStatus2["WebhookStatusTemporarilyDisabled"] = "temporarily_disabled";
  return WebhookStatus2;
})(WebhookStatus || {});
var timeline_exports = {};
__export(timeline_exports, {
  EventType: () => EventType2,
  TrackableType: () => TrackableType
});
var EventType2 = /* @__PURE__ */ ((EventType3) => {
  EventType3["EventTypeIssueCommentCreated"] = "issue_comment_created";
  EventType3["EventTypeIssueCreated"] = "issue_created";
  EventType3["EventTypeIssueLabelUpdated"] = "issue_label_updated";
  EventType3["EventTypeIssueMergeRequestLinked"] = "issue_merge_request_linked";
  EventType3["EventTypeIssueMergeRequestUnlinked"] = "issue_merge_request_unlinked";
  EventType3["EventTypeIssueParentIssueAdded"] = "issue_parent_issue_added";
  EventType3["EventTypeIssueParentIssueRemoved"] = "issue_parent_issue_removed";
  EventType3["EventTypeIssueSubIssueAdded"] = "issue_sub_issue_added";
  EventType3["EventTypeIssueSubIssueRemoved"] = "issue_sub_issue_removed";
  EventType3["EventTypeIssueUpdated"] = "issue_updated";
  EventType3["EventTypeMergeRequestBypassed"] = "merge_request_bypassed";
  EventType3["EventTypeMergeRequestClosed"] = "merge_request_closed";
  EventType3["EventTypeMergeRequestCreated"] = "merge_request_created";
  EventType3["EventTypeMergeRequestDequeued"] = "merge_request_dequeued";
  EventType3["EventTypeMergeRequestEdited"] = "merge_request_edited";
  EventType3["EventTypeMergeRequestEnqueued"] = "merge_request_enqueued";
  EventType3["EventTypeMergeRequestLabelUpdated"] = "merge_request_label_updated";
  EventType3["EventTypeMergeRequestMarkedAsDraft"] = "merge_request_marked_as_draft";
  EventType3["EventTypeMergeRequestMarkedAsReady"] = "merge_request_marked_as_ready";
  EventType3["EventTypeMergeRequestMerged"] = "merge_request_merged";
  EventType3["EventTypeMergeRequestPushed"] = "merge_request_pushed";
  EventType3["EventTypeMergeRequestReopened"] = "merge_request_reopened";
  EventType3["EventTypeMergeRequestReviewed"] = "merge_request_reviewed";
  EventType3["EventTypeWorkItemLinkCreated"] = "work_item_link_created";
  EventType3["EventTypeWorkItemLinkDeleted"] = "work_item_link_deleted";
  return EventType3;
})(EventType2 || {});
var TrackableType = /* @__PURE__ */ ((TrackableType2) => {
  TrackableType2["TrackableTypeIssue"] = "issue";
  TrackableType2["TrackableTypeMergeRequest"] = "merge_request";
  return TrackableType2;
})(TrackableType || {});
var vcs_exports = {};
__export(vcs_exports, {
  BranchType: () => BranchType,
  CommitFileAction: () => CommitFileAction,
  FileEncoding: () => FileEncoding,
  FileType: () => FileType,
  GitChangeType: () => GitChangeType,
  QueryMode: () => QueryMode,
  ReferenceType: () => ReferenceType
});
var BranchType = /* @__PURE__ */ ((BranchType2) => {
  BranchType2["BranchTypeActive"] = "active";
  BranchType2["BranchTypeAll"] = "all";
  BranchType2["BranchTypeMerged"] = "merged";
  BranchType2["BranchTypeStale"] = "stale";
  BranchType2["BranchTypeYours"] = "yours";
  return BranchType2;
})(BranchType || {});
var CommitFileAction = /* @__PURE__ */ ((CommitFileAction2) => {
  CommitFileAction2["CommitFileActionChmod"] = "chmod";
  CommitFileAction2["CommitFileActionCreate"] = "create";
  CommitFileAction2["CommitFileActionCreateDir"] = "create_dir";
  CommitFileAction2["CommitFileActionDelete"] = "delete";
  CommitFileAction2["CommitFileActionMove"] = "move";
  CommitFileAction2["CommitFileActionUpdate"] = "update";
  return CommitFileAction2;
})(CommitFileAction || {});
var FileEncoding = /* @__PURE__ */ ((FileEncoding2) => {
  FileEncoding2["FileEncodingBase64"] = "base64";
  FileEncoding2["FileEncodingText"] = "text";
  return FileEncoding2;
})(FileEncoding || {});
var FileType = /* @__PURE__ */ ((FileType2) => {
  FileType2["FileTypeDirectory"] = "directory";
  FileType2["FileTypeNormalFile"] = "normal_file";
  FileType2["FileTypeSubmodule"] = "submodule";
  FileType2["FileTypeSymbolicLink"] = "symbolic_link";
  return FileType2;
})(FileType || {});
var GitChangeType = /* @__PURE__ */ ((GitChangeType2) => {
  GitChangeType2["ChangeTypeAdded"] = "added";
  GitChangeType2["ChangeTypeDeleted"] = "deleted";
  GitChangeType2["ChangeTypeModified"] = "modified";
  GitChangeType2["ChangeTypeRenamed"] = "renamed";
  return GitChangeType2;
})(GitChangeType || {});
var QueryMode = /* @__PURE__ */ ((QueryMode2) => {
  QueryMode2["QueryModeGlob"] = "glob";
  QueryMode2["QueryModePrefix"] = "prefix";
  QueryMode2["QueryModeSubstr"] = "substr";
  QueryMode2["QueryModeSuffix"] = "suffix";
  QueryMode2["QueryModeWildcard"] = "wildcard";
  return QueryMode2;
})(QueryMode || {});
var ReferenceType = /* @__PURE__ */ ((ReferenceType2) => {
  ReferenceType2["ReferenceTypeBranch"] = "branch";
  ReferenceType2["ReferenceTypeTag"] = "tag";
  return ReferenceType2;
})(ReferenceType || {});
var work_item_exports = {};
__export(work_item_exports, {
  LinkType: () => LinkType,
  WorkItemPlatform: () => WorkItemPlatform
});
var LinkType = /* @__PURE__ */ ((LinkType2) => {
  LinkType2["LinkTypeMergeRequestTitleOrDescription"] = "merge_request_title_or_description";
  return LinkType2;
})(LinkType || {});
var WorkItemPlatform = /* @__PURE__ */ ((WorkItemPlatform2) => {
  WorkItemPlatform2["WorkItemPlatformIssue"] = "issue";
  WorkItemPlatform2["WorkItemPlatformMeego"] = "meego";
  WorkItemPlatform2["WorkItemPlatformTTJira"] = "ttjira";
  return WorkItemPlatform2;
})(WorkItemPlatform || {});
var CodebaseAppOpenapiService = class {
  request = () => {
    throw new Error("CodebaseAppOpenapiService.request is undefined");
  };
  baseURL = "";
  constructor(options) {
    this.request = options?.request || this.request;
    this.baseURL = options?.baseURL || this.baseURL;
  }
  genBaseURL(path) {
    return typeof this.baseURL === "string" ? this.baseURL + path : this.baseURL(path);
  }
  /**
   * POST /UpdateProtectedTag
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404309)
   */
  UpdateProtectedTag(req, options) {
    const _req = req;
    const url = this.genBaseURL("/UpdateProtectedTag");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      Id: _req["Id"],
      NamePattern: _req["NamePattern"],
      CreateAccess: _req["CreateAccess"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /GetProtectedBranch
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404310)
   */
  GetProtectedBranch(req, options) {
    const _req = req;
    const url = this.genBaseURL("/GetProtectedBranch");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      Id: _req["Id"],
      NamePattern: _req["NamePattern"],
      BranchName: _req["BranchName"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /CreateReview
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404311)
   */
  CreateReview(req, options) {
    const _req = req;
    const url = this.genBaseURL("/CreateReview");
    const method = "POST";
    const data = {
      MergeRequestId: _req["MergeRequestId"],
      CommitId: _req["CommitId"],
      Status: _req["Status"],
      Content: _req["Content"],
      PublishDraftComments: _req["PublishDraftComments"],
      RepoId: _req["RepoId"],
      ResetApprovalAfterRework: _req["ResetApprovalAfterRework"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /ListMergeRequestBypasses
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404312)
   */
  ListMergeRequestBypasses(req, options) {
    const _req = req;
    const url = this.genBaseURL("/ListMergeRequestBypasses");
    const method = "POST";
    const data = {
      MergeRequestId: _req["MergeRequestId"],
      CommitId: _req["CommitId"],
      RepoId: _req["RepoId"],
      Number: _req["Number"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /CountDivergingCommits
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404313)
   *
   * Count the ahead and behind commis between the two commits.
   */
  CountDivergingCommits(req, options) {
    const _req = req;
    const url = this.genBaseURL("/CountDivergingCommits");
    const method = "POST";
    const data = { RepoId: _req["RepoId"], Options: _req["Options"] };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /CloseMergeRequest
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404314)
   */
  CloseMergeRequest(req, options) {
    const _req = req;
    const url = this.genBaseURL("/CloseMergeRequest");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      Id: _req["Id"],
      Number: _req["Number"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /ListDiffFiles
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404315)
   *
   * List diff files info of the given two commits.
   */
  ListDiffFiles(req, options) {
    const _req = req;
    const url = this.genBaseURL("/ListDiffFiles");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      FromCommit: _req["FromCommit"],
      ToCommit: _req["ToCommit"],
      IsStraight: _req["IsStraight"],
      RawStatOnly: _req["RawStatOnly"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /UpdateMergeRequest
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404316)
   */
  UpdateMergeRequest(req, options) {
    const _req = req;
    const url = this.genBaseURL("/UpdateMergeRequest");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      Id: _req["Id"],
      Number: _req["Number"],
      Title: _req["Title"],
      Description: _req["Description"],
      AutoMerge: _req["AutoMerge"],
      MergeMethod: _req["MergeMethod"],
      RemoveSourceBranchAfterMerge: _req["RemoveSourceBranchAfterMerge"],
      MergeCommitMessage: _req["MergeCommitMessage"],
      SquashCommitMessage: _req["SquashCommitMessage"],
      WIP: _req["WIP"],
      WorkItemIds: _req["WorkItemIds"],
      TargetBranch: _req["TargetBranch"],
      AddLinks: _req["AddLinks"],
      RemoveLinks: _req["RemoveLinks"],
      AutoInviteReviewers: _req["AutoInviteReviewers"],
      SquashCommits: _req["SquashCommits"],
      Draft: _req["Draft"],
      MilestoneId: _req["MilestoneId"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /UpdateCheckRun
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404317)
   */
  UpdateCheckRun(req, options) {
    const _req = req;
    const url = this.genBaseURL("/UpdateCheckRun");
    const method = "POST";
    const data = {
      Id: _req["Id"],
      Status: _req["Status"],
      Conclusion: _req["Conclusion"],
      Description: _req["Description"],
      Text: _req["Text"],
      TextHTML: _req["TextHTML"],
      DetailsURL: _req["DetailsURL"],
      Annotations: _req["Annotations"],
      Operations: _req["Operations"],
      StartedAt: _req["StartedAt"],
      CompletedAt: _req["CompletedAt"],
      RepoId: _req["RepoId"],
      DisplayMode: _req["DisplayMode"],
      AddAnnotations: _req["AddAnnotations"],
      DeleteAnnotationIds: _req["DeleteAnnotationIds"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /CreateTag
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404318)
   *
   * Create tag.
   */
  CreateTag(req, options) {
    const _req = req;
    const url = this.genBaseURL("/CreateTag");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      Name: _req["Name"],
      Revision: _req["Revision"],
      Message: _req["Message"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /CreateMergeRequest
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404319)
   */
  CreateMergeRequest(req, options) {
    const _req = req;
    const url = this.genBaseURL("/CreateMergeRequest");
    const method = "POST";
    const data = {
      SourceRepoId: _req["SourceRepoId"],
      SourceBranch: _req["SourceBranch"],
      TargetRepoId: _req["TargetRepoId"],
      TargetBranch: _req["TargetBranch"],
      Title: _req["Title"],
      Description: _req["Description"],
      MergeMethod: _req["MergeMethod"],
      SquashCommits: _req["SquashCommits"],
      MergeCommitMessage: _req["MergeCommitMessage"],
      SquashCommitMessage: _req["SquashCommitMessage"],
      RemoveSourceBranchAfterMerge: _req["RemoveSourceBranchAfterMerge"],
      ReviewerIds: _req["ReviewerIds"],
      WorkItemIds: _req["WorkItemIds"],
      AutoInviteReviewers: _req["AutoInviteReviewers"],
      Links: _req["Links"],
      AutoLinkWorkItems: _req["AutoLinkWorkItems"],
      Draft: _req["Draft"],
      LabelIds: _req["LabelIds"],
      MilestoneId: _req["MilestoneId"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /GetRepository
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404320)
   *
   * 根据id获取仓库
   */
  GetRepository(req, options) {
    const _req = req || {};
    const url = this.genBaseURL("/GetRepository");
    const method = "POST";
    const data = {
      Id: _req["Id"],
      WithPermissions: _req["WithPermissions"],
      Path: _req["Path"],
      Selector: _req["Selector"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /ListCheckRuns
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404321)
   */
  ListCheckRuns(req, options) {
    const _req = req;
    const url = this.genBaseURL("/ListCheckRuns");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      CommitId: _req["CommitId"],
      MergeRequestId: _req["MergeRequestId"],
      Branch: _req["Branch"],
      AppId: _req["AppId"],
      PageNumber: _req["PageNumber"],
      PageSize: _req["PageSize"],
      GetUnfinalizedApps: _req["GetUnfinalizedApps"],
      Selector: _req["Selector"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /GetProtectedTag
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404322)
   */
  GetProtectedTag(req, options) {
    const _req = req;
    const url = this.genBaseURL("/GetProtectedTag");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      Id: _req["Id"],
      NamePattern: _req["NamePattern"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /CreateComment
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404323)
   */
  CreateComment(req, options) {
    const _req = req;
    const url = this.genBaseURL("/CreateComment");
    const method = "POST";
    const data = {
      CommentableType: _req["CommentableType"],
      CommentableId: _req["CommentableId"],
      RepoId: _req["RepoId"],
      CommitId: _req["CommitId"],
      ThreadId: _req["ThreadId"],
      Content: _req["Content"],
      Position: _req["Position"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /CreateProtectedTag
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404324)
   */
  CreateProtectedTag(req, options) {
    const _req = req;
    const url = this.genBaseURL("/CreateProtectedTag");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      NamePattern: _req["NamePattern"],
      CreateAccess: _req["CreateAccess"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /MergeMergeRequest
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404325)
   */
  MergeMergeRequest(req, options) {
    const _req = req;
    const url = this.genBaseURL("/MergeMergeRequest");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      Id: _req["Id"],
      Number: _req["Number"],
      MergeMethod: _req["MergeMethod"],
      RemoveSourceBranchAfterMerge: _req["RemoveSourceBranchAfterMerge"],
      MergeCommitMessage: _req["MergeCommitMessage"],
      SquashCommitMessage: _req["SquashCommitMessage"],
      SquashCommits: _req["SquashCommits"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /CreateProtectedBranch
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404326)
   */
  CreateProtectedBranch(req, options) {
    const _req = req;
    const url = this.genBaseURL("/CreateProtectedBranch");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      NamePattern: _req["NamePattern"],
      CreateAccess: _req["CreateAccess"],
      MergeAccess: _req["MergeAccess"],
      PushAccess: _req["PushAccess"],
      ForcePushAccess: _req["ForcePushAccess"],
      DeleteAccess: _req["DeleteAccess"],
      BypassAccess: _req["BypassAccess"],
      AllowCodeOwnerBypass: _req["AllowCodeOwnerBypass"],
      RequireReview: _req["RequireReview"],
      ReviewRules: _req["ReviewRules"],
      RequireCodeOwnerReview: _req["RequireCodeOwnerReview"],
      AllowAuthorApproval: _req["AllowAuthorApproval"],
      ApprovalResetLevel: _req["ApprovalResetLevel"],
      RequireCheckRunPass: _req["RequireCheckRunPass"],
      CheckRunRules: _req["CheckRunRules"],
      RequireThreadResolution: _req["RequireThreadResolution"],
      RequireWorkItemLink: _req["RequireWorkItemLink"],
      RequireMergeQueue: _req["RequireMergeQueue"],
      MergeQueueSetting: _req["MergeQueueSetting"],
      UseInheritedReviewRules: _req["UseInheritedReviewRules"],
      ReviewRulesetId: _req["ReviewRulesetId"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /UpdateAppReviewRules
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404327)
   */
  UpdateAppReviewRules(req, options) {
    const _req = req;
    const url = this.genBaseURL("/UpdateAppReviewRules");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      MergeRequestId: _req["MergeRequestId"],
      CommitId: _req["CommitId"],
      ReviewRules: _req["ReviewRules"],
      AddReviewRules: _req["AddReviewRules"],
      RemoveReviewRuleNames: _req["RemoveReviewRuleNames"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /UpdateReviewers
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404329)
   */
  UpdateReviewers(req, options) {
    const _req = req;
    const url = this.genBaseURL("/UpdateReviewers");
    const method = "POST";
    const data = {
      MergeRequestId: _req["MergeRequestId"],
      ReviewerIds: _req["ReviewerIds"],
      RepoId: _req["RepoId"],
      AddReviewerIds: _req["AddReviewerIds"],
      RemoveReviewerIds: _req["RemoveReviewerIds"],
      SetReviewers: _req["SetReviewers"],
      AddReviewers: _req["AddReviewers"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /CreateCheckRun
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404330)
   */
  CreateCheckRun(req, options) {
    const _req = req;
    const url = this.genBaseURL("/CreateCheckRun");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      CommitId: _req["CommitId"],
      MergeRequestId: _req["MergeRequestId"],
      Branch: _req["Branch"],
      ExternalId: _req["ExternalId"],
      Name: _req["Name"],
      Status: _req["Status"],
      Conclusion: _req["Conclusion"],
      Description: _req["Description"],
      Text: _req["Text"],
      TextHTML: _req["TextHTML"],
      DetailsURL: _req["DetailsURL"],
      Annotations: _req["Annotations"],
      Operations: _req["Operations"],
      StartedAt: _req["StartedAt"],
      CompletedAt: _req["CompletedAt"],
      DisplayMode: _req["DisplayMode"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /MGetThreads
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404331)
   */
  MGetThreads(req, options) {
    const _req = req;
    const url = this.genBaseURL("/MGetThreads");
    const method = "POST";
    const data = { RepoId: _req["RepoId"], ThreadIds: _req["ThreadIds"] };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /ReopenMergeRequest
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404332)
   */
  ReopenMergeRequest(req, options) {
    const _req = req;
    const url = this.genBaseURL("/ReopenMergeRequest");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      Id: _req["Id"],
      Number: _req["Number"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /ListThreads
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404333)
   */
  ListThreads(req, options) {
    const _req = req;
    const url = this.genBaseURL("/ListThreads");
    const method = "POST";
    const data = {
      CommentableType: _req["CommentableType"],
      CommentableId: _req["CommentableId"],
      RepoId: _req["RepoId"],
      CommitId: _req["CommitId"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /GetComment
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404334)
   */
  GetComment(req, options) {
    const _req = req;
    const url = this.genBaseURL("/GetComment");
    const method = "POST";
    const data = { Id: _req["Id"], RepoId: _req["RepoId"] };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /CreateCommit
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404335)
   *
   * Create a commit with multiple files and actions. eg: `create`, `update`, `delete`, `move`, `chmod`, `create_dir`
   */
  CreateCommit(req, options) {
    const _req = req;
    const url = this.genBaseURL("/CreateCommit");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      Branch: _req["Branch"],
      StartBranch: _req["StartBranch"],
      CommitMessage: _req["CommitMessage"],
      CommitAuthorName: _req["CommitAuthorName"],
      CommitAuthorEmail: _req["CommitAuthorEmail"],
      CommitFilesActions: _req["CommitFilesActions"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /DeleteTag
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404336)
   *
   * Delete tag.
   */
  DeleteTag(req, options) {
    const _req = req;
    const url = this.genBaseURL("/DeleteTag");
    const method = "POST";
    const data = { RepoId: _req["RepoId"], Name: _req["Name"] };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /GetMergeQueue
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404337)
   */
  GetMergeQueue(req, options) {
    const _req = req;
    const url = this.genBaseURL("/GetMergeQueue");
    const method = "POST";
    const data = { RepoId: _req["RepoId"], TargetBranch: _req["TargetBranch"] };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /GetBranch
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404338)
   *
   * Get branch by name.
   */
  GetBranch(req, options) {
    const _req = req;
    const url = this.genBaseURL("/GetBranch");
    const method = "POST";
    const data = { RepoId: _req["RepoId"], Name: _req["Name"] };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /UpdateProtectedBranch
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404339)
   */
  UpdateProtectedBranch(req, options) {
    const _req = req;
    const url = this.genBaseURL("/UpdateProtectedBranch");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      Id: _req["Id"],
      NamePattern: _req["NamePattern"],
      CreateAccess: _req["CreateAccess"],
      MergeAccess: _req["MergeAccess"],
      PushAccess: _req["PushAccess"],
      ForcePushAccess: _req["ForcePushAccess"],
      DeleteAccess: _req["DeleteAccess"],
      BypassAccess: _req["BypassAccess"],
      AllowCodeOwnerBypass: _req["AllowCodeOwnerBypass"],
      RequireReview: _req["RequireReview"],
      ReviewRules: _req["ReviewRules"],
      RequireCodeOwnerReview: _req["RequireCodeOwnerReview"],
      AllowAuthorApproval: _req["AllowAuthorApproval"],
      ApprovalResetLevel: _req["ApprovalResetLevel"],
      RequireCheckRunPass: _req["RequireCheckRunPass"],
      CheckRunRules: _req["CheckRunRules"],
      RequireThreadResolution: _req["RequireThreadResolution"],
      RequireWorkItemLink: _req["RequireWorkItemLink"],
      RequireMergeQueue: _req["RequireMergeQueue"],
      MergeQueueSetting: _req["MergeQueueSetting"],
      UseInheritedReviewRules: _req["UseInheritedReviewRules"],
      ReviewRulesetId: _req["ReviewRulesetId"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /UpdateRepository
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404340)
   *
   * 更新仓库信息与设置
   */
  UpdateRepository(req, options) {
    const _req = req;
    const url = this.genBaseURL("/UpdateRepository");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      Name: _req["Name"],
      Desc: _req["Desc"],
      DefaultBranch: _req["DefaultBranch"],
      MergeMethod: _req["MergeMethod"],
      AllowedMergeMethods: _req["AllowedMergeMethods"],
      RemoveSourceBranchAfterMerge: _req["RemoveSourceBranchAfterMerge"],
      AllowedMergeRequestChangeModes: _req["AllowedMergeRequestChangeModes"],
      EnabledAutoTransitionWorkItemsAfterMergePlatforms: _req["EnabledAutoTransitionWorkItemsAfterMergePlatforms"],
      EnabledWorkItemPlatforms: _req["EnabledWorkItemPlatforms"],
      SquashCommitsBeforeMergeLevel: _req["SquashCommitsBeforeMergeLevel"],
      AutoResolveOutdatedThreads: _req["AutoResolveOutdatedThreads"],
      Topics: _req["Topics"],
      Features: _req["Features"],
      AvatarURL: _req["AvatarURL"],
      Properties: _req["Properties"],
      ReviewRules: _req["ReviewRules"],
      LFSEnabled: _req["LFSEnabled"],
      LFSIntegrityCheckRequired: _req["LFSIntegrityCheckRequired"],
      LowercaseRefNameCheckRequired: _req["LowercaseRefNameCheckRequired"],
      FileSizeCheckRequired: _req["FileSizeCheckRequired"],
      MaxFileSize: _req["MaxFileSize"],
      MergeCommitMessageTemplate: _req["MergeCommitMessageTemplate"],
      SquashCommitMessageTemplate: _req["SquashCommitMessageTemplate"],
      IssueEnabled: _req["IssueEnabled"],
      ReviewRulesets: _req["ReviewRulesets"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /ListRangeDiffFiles
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404341)
   *
   * List range diff files info of the given two ranges.
   */
  ListRangeDiffFiles(req, options) {
    const _req = req;
    const url = this.genBaseURL("/ListRangeDiffFiles");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      OldFromRevision: _req["OldFromRevision"],
      OldToRevision: _req["OldToRevision"],
      NewFromRevision: _req["NewFromRevision"],
      NewToRevision: _req["NewToRevision"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /GetMergeRequestSetting
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404342)
   */
  GetMergeRequestSetting(req, options) {
    const _req = req;
    const url = this.genBaseURL("/GetMergeRequestSetting");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      MergeRequestId: _req["MergeRequestId"],
      Number: _req["Number"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /DeleteBranches
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404343)
   *
   * Delete branches by type.
   */
  DeleteBranches(req, options) {
    const _req = req;
    const url = this.genBaseURL("/DeleteBranches");
    const method = "POST";
    const data = { RepoId: _req["RepoId"], Type: _req["Type"] };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /DeleteComment
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404344)
   */
  DeleteComment(req, options) {
    const _req = req;
    const url = this.genBaseURL("/DeleteComment");
    const method = "POST";
    const data = { Id: _req["Id"], RepoId: _req["RepoId"] };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /GetMergeRequest
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404345)
   */
  GetMergeRequest(req, options) {
    const _req = req;
    const url = this.genBaseURL("/GetMergeRequest");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      Id: _req["Id"],
      Number: _req["Number"],
      ChangeId: _req["ChangeId"],
      Selector: _req["Selector"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /BatchUpdateMergeRequests
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404346)
   */
  BatchUpdateMergeRequests(req, options) {
    const _req = req || {};
    const url = this.genBaseURL("/BatchUpdateMergeRequests");
    const method = "POST";
    const data = { Updates: _req["Updates"] };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /ListFiles
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404347)
   *
   * Get a list of files by paths.
   */
  ListFiles(req, options) {
    const _req = req;
    const url = this.genBaseURL("/ListFiles");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      Revision: _req["Revision"],
      Paths: _req["Paths"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /GetRepoMergeRequestsCount
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404348)
   */
  GetRepoMergeRequestsCount(req, options) {
    const _req = req;
    const url = this.genBaseURL("/GetRepoMergeRequestsCount");
    const method = "POST";
    const data = {
      TargetRepoId: _req["TargetRepoId"],
      SourceBranch: _req["SourceBranch"],
      TargetBranch: _req["TargetBranch"],
      AuthorId: _req["AuthorId"],
      Author: _req["Author"],
      Title: _req["Title"],
      CommitId: _req["CommitId"],
      ReviewerId: _req["ReviewerId"],
      Reviewer: _req["Reviewer"],
      WIP: _req["WIP"],
      Draft: _req["Draft"],
      ReviewStatus: _req["ReviewStatus"],
      MilestoneIds: _req["MilestoneIds"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /DeleteProtectedTag
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404349)
   */
  DeleteProtectedTag(req, options) {
    const _req = req;
    const url = this.genBaseURL("/DeleteProtectedTag");
    const method = "POST";
    const data = { RepoId: _req["RepoId"], Id: _req["Id"] };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /CreateBranch
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404350)
   *
   * Create a branch from the existed commit/branch/tag.
   */
  CreateBranch(req, options) {
    const _req = req;
    const url = this.genBaseURL("/CreateBranch");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      Revision: _req["Revision"],
      Name: _req["Name"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /GetMergeRequestMergeability
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404351)
   */
  GetMergeRequestMergeability(req, options) {
    const _req = req;
    const url = this.genBaseURL("/GetMergeRequestMergeability");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      Id: _req["Id"],
      Number: _req["Number"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /ListDiffCommits
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404352)
   *
   * List diff commits between the given two commits.
   */
  ListDiffCommits(req, options) {
    const _req = req;
    const url = this.genBaseURL("/ListDiffCommits");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      FromCommit: _req["FromCommit"],
      ToCommit: _req["ToCommit"],
      IsStraight: _req["IsStraight"],
      PageNumber: _req["PageNumber"],
      PageSize: _req["PageSize"],
      WithTotalCount: _req["WithTotalCount"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /GetCheckRun
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404353)
   */
  GetCheckRun(req, options) {
    const _req = req;
    const url = this.genBaseURL("/GetCheckRun");
    const method = "POST";
    const data = { Id: _req["Id"], RepoId: _req["RepoId"] };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /OperateCheckRun
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404354)
   */
  OperateCheckRun(req, options) {
    const _req = req;
    const url = this.genBaseURL("/OperateCheckRun");
    const method = "POST";
    const data = {
      CheckRunId: _req["CheckRunId"],
      OperationId: _req["OperationId"],
      RepoId: _req["RepoId"],
      AnnotationId: _req["AnnotationId"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /GetReviewStatus
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404355)
   */
  GetReviewStatus(req, options) {
    const _req = req;
    const url = this.genBaseURL("/GetReviewStatus");
    const method = "POST";
    const data = {
      MergeRequestId: _req["MergeRequestId"],
      RepoId: _req["RepoId"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /DeleteBranch
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404356)
   *
   * Delete the branch by name.
   */
  DeleteBranch(req, options) {
    const _req = req;
    const url = this.genBaseURL("/DeleteBranch");
    const method = "POST";
    const data = { RepoId: _req["RepoId"], Name: _req["Name"] };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /ListRangeDiffFileContents
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404357)
   *
   * List range diff files contents of the given two ranges.
   */
  ListRangeDiffFileContents(req, options) {
    const _req = req;
    const url = this.genBaseURL("/ListRangeDiffFileContents");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      OldFromRevision: _req["OldFromRevision"],
      OldToRevision: _req["OldToRevision"],
      NewFromRevision: _req["NewFromRevision"],
      NewToRevision: _req["NewToRevision"],
      Files: _req["Files"],
      IgnoreWhitespaces: _req["IgnoreWhitespaces"],
      Context: _req["Context"],
      MaxPatchBytes: _req["MaxPatchBytes"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /ListTimelineEvents
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404358)
   */
  ListTimelineEvents(req, options) {
    const _req = req;
    const url = this.genBaseURL("/ListTimelineEvents");
    const method = "POST";
    const data = {
      TrackableType: _req["TrackableType"],
      TrackableId: _req["TrackableId"],
      RepoId: _req["RepoId"],
      For1024: _req["For1024"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /ListCommits
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404359)
   *
   * List commits history.
   */
  ListCommits(req, options) {
    const _req = req;
    const url = this.genBaseURL("/ListCommits");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      Revision: _req["Revision"],
      Path: _req["Path"],
      PageNumber: _req["PageNumber"],
      PageSize: _req["PageSize"],
      Author: _req["Author"],
      CommittedAfter: _req["CommittedAfter"],
      CommittedBefore: _req["CommittedBefore"],
      Query: _req["Query"],
      FirstParent: _req["FirstParent"],
      Paths: _req["Paths"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /ListDiffFileContents
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404360)
   *
   * List diff files contents of the given two commits.
   */
  ListDiffFileContents(req, options) {
    const _req = req;
    const url = this.genBaseURL("/ListDiffFileContents");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      FromCommit: _req["FromCommit"],
      ToCommit: _req["ToCommit"],
      IsStraight: _req["IsStraight"],
      Files: _req["Files"],
      IgnoreWhitespaces: _req["IgnoreWhitespaces"],
      Context: _req["Context"],
      MaxPatchBytes: _req["MaxPatchBytes"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /CreateAppReviewResets
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404361)
   */
  CreateAppReviewResets(req, options) {
    const _req = req;
    const url = this.genBaseURL("/CreateAppReviewResets");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      MergeRequestId: _req["MergeRequestId"],
      CommitId: _req["CommitId"],
      ReviewResetInputs: _req["ReviewResetInputs"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /UpdateThread
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404362)
   */
  UpdateThread(req, options) {
    const _req = req;
    const url = this.genBaseURL("/UpdateThread");
    const method = "POST";
    const data = {
      Id: _req["Id"],
      Status: _req["Status"],
      RepoId: _req["RepoId"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /GetTag
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404363)
   *
   * Get tag by name.
   */
  GetTag(req, options) {
    const _req = req;
    const url = this.genBaseURL("/GetTag");
    const method = "POST";
    const data = { RepoId: _req["RepoId"], Name: _req["Name"] };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /GetFile
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404364)
   *
   * Get file by path.
   */
  GetFile(req, options) {
    const _req = req;
    const url = this.genBaseURL("/GetFile");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      Revision: _req["Revision"],
      Path: _req["Path"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /GetDefaultBranch
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404365)
   *
   * Get the default branch of the Git repository, which may be empty.
   */
  GetDefaultBranch(req, options) {
    const _req = req;
    const url = this.genBaseURL("/GetDefaultBranch");
    const method = "POST";
    const data = { RepoId: _req["RepoId"] };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /GetThread
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404366)
   */
  GetThread(req, options) {
    const _req = req;
    const url = this.genBaseURL("/GetThread");
    const method = "POST";
    const data = { Id: _req["Id"], RepoId: _req["RepoId"] };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /GetCommit
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404367)
   *
   * Get commit by revision.
   */
  GetCommit(req, options) {
    const _req = req;
    const url = this.genBaseURL("/GetCommit");
    const method = "POST";
    const data = { RepoId: _req["RepoId"], Revision: _req["Revision"] };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /ListRepoMergeRequests
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404368)
   */
  ListRepoMergeRequests(req, options) {
    const _req = req;
    const url = this.genBaseURL("/ListRepoMergeRequests");
    const method = "POST";
    const data = {
      TargetRepoId: _req["TargetRepoId"],
      SourceBranch: _req["SourceBranch"],
      TargetBranch: _req["TargetBranch"],
      Status: _req["Status"],
      AuthorId: _req["AuthorId"],
      Author: _req["Author"],
      Title: _req["Title"],
      CommitId: _req["CommitId"],
      ReviewerId: _req["ReviewerId"],
      Reviewer: _req["Reviewer"],
      PageNumber: _req["PageNumber"],
      PageSize: _req["PageSize"],
      SortBy: _req["SortBy"],
      SortOrder: _req["SortOrder"],
      Selector: _req["Selector"],
      WIP: _req["WIP"],
      ReviewStatus: _req["ReviewStatus"],
      Draft: _req["Draft"],
      AttentionUserId: _req["AttentionUserId"],
      AttentionUsername: _req["AttentionUsername"],
      Labels: _req["Labels"],
      Since: _req["Since"],
      MilestoneIds: _req["MilestoneIds"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /ListReviewers
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404369)
   */
  ListReviewers(req, options) {
    const _req = req;
    const url = this.genBaseURL("/ListReviewers");
    const method = "POST";
    const data = {
      MergeRequestId: _req["MergeRequestId"],
      RepoId: _req["RepoId"],
      WithMeetReviewRules: _req["WithMeetReviewRules"],
      WithPendingEffectiveApprover: _req["WithPendingEffectiveApprover"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /UpdateComment
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404370)
   */
  UpdateComment(req, options) {
    const _req = req;
    const url = this.genBaseURL("/UpdateComment");
    const method = "POST";
    const data = {
      Id: _req["Id"],
      Content: _req["Content"],
      RepoId: _req["RepoId"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /DeleteProtectedBranch
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404371)
   */
  DeleteProtectedBranch(req, options) {
    const _req = req;
    const url = this.genBaseURL("/DeleteProtectedBranch");
    const method = "POST";
    const data = { RepoId: _req["RepoId"], Id: _req["Id"] };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /UpdateUserRelatedFilePathsForApp
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404372)
   */
  UpdateUserRelatedFilePathsForApp(req, options) {
    const _req = req;
    const url = this.genBaseURL("/UpdateUserRelatedFilePathsForApp");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      MergeRequestId: _req["MergeRequestId"],
      SetUserRelatedFilePaths: _req["SetUserRelatedFilePaths"],
      AddUserRelatedFilePaths: _req["AddUserRelatedFilePaths"],
      RemoveUserRelatedFilePaths: _req["RemoveUserRelatedFilePaths"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /MGetThreadsCounts
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404373)
   */
  MGetThreadsCounts(req, options) {
    const _req = req;
    const url = this.genBaseURL("/MGetThreadsCounts");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      CommentableType: _req["CommentableType"],
      CommentableIds: _req["CommentableIds"],
      CommitIds: _req["CommitIds"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /ListDirectoryEntries
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404374)
   *
   * List directory entries by path.
   */
  ListDirectoryEntries(req, options) {
    const _req = req;
    const url = this.genBaseURL("/ListDirectoryEntries");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      Revision: _req["Revision"],
      Path: _req["Path"],
      PageToken: _req["PageToken"],
      PageSize: _req["PageSize"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /ListMergeQueueHistoryEntries
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404464)
   */
  ListMergeQueueEntries(req, options) {
    const _req = req;
    const url = this.genBaseURL("/ListMergeQueueHistoryEntries");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      TargetBranch: _req["TargetBranch"],
      StatusIn: _req["StatusIn"],
      PageNumber: _req["PageNumber"],
      PageSize: _req["PageSize"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /ListMergeRequestQueueEntries
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2404465)
   */
  ListMergeRequestQueueEntries(req, options) {
    const _req = req;
    const url = this.genBaseURL("/ListMergeRequestQueueEntries");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      MergeRequestNumber: _req["MergeRequestNumber"],
      PageNumber: _req["PageNumber"],
      PageSize: _req["PageSize"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /SignUserJWT
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2469686)
   *
   * 为 App 生成用户身份的 jwt
   */
  SignUserJWT(req, options) {
    const _req = req;
    const url = this.genBaseURL("/SignUserJWT");
    const method = "POST";
    const data = {
      Scopes: _req["Scopes"],
      CloudUserJWT: _req["CloudUserJWT"],
      Username: _req["Username"],
      Expiration: _req["Expiration"],
      RepoRevisions: _req["RepoRevisions"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /Rebase
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2495149)
   *
   * Rebase the specified Branch (from Upstream) onto the BaseBranch
   */
  Rebase(req, options) {
    const _req = req;
    const url = this.genBaseURL("/Rebase");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      Branch: _req["Branch"],
      BaseBranch: _req["BaseBranch"],
      Upstream: _req["Upstream"],
      DryRun: _req["DryRun"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /ListWorkItemLinks
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2526649)
   */
  ListWorkItemLinks(req, options) {
    const _req = req;
    const url = this.genBaseURL("/ListWorkItemLinks");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      MergeRequestId: _req["MergeRequestId"],
      PageNumber: _req["PageNumber"],
      PageSize: _req["PageSize"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /DequeueMergeRequest
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2526654)
   */
  DequeueMergeRequest(req, options) {
    const _req = req;
    const url = this.genBaseURL("/DequeueMergeRequest");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      MergeRequestNumber: _req["MergeRequestNumber"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /EnqueueMergeRequest
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2526655)
   */
  EnqueueMergeRequest(req, options) {
    const _req = req;
    const url = this.genBaseURL("/EnqueueMergeRequest");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      MergeRequestNumber: _req["MergeRequestNumber"],
      MergeMethod: _req["MergeMethod"],
      RemoveSourceBranchAfterMerge: _req["RemoveSourceBranchAfterMerge"],
      MergeCommitMessage: _req["MergeCommitMessage"],
      SquashCommitMessage: _req["SquashCommitMessage"],
      SquashCommits: _req["SquashCommits"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /DeleteWorkItemLinks
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2548661)
   */
  DeleteWorkItemLinks(req, options) {
    const _req = req;
    const url = this.genBaseURL("/DeleteWorkItemLinks");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      MergeRequestId: _req["MergeRequestId"],
      WorkItemIds: _req["WorkItemIds"],
      ExternalIDsByPlatform: _req["ExternalIDsByPlatform"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /CreateWorkItemLinks
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2548662)
   */
  CreateWorkItemLinks(req, options) {
    const _req = req;
    const url = this.genBaseURL("/CreateWorkItemLinks");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      MergeRequestId: _req["MergeRequestId"],
      WorkItemIds: _req["WorkItemIds"],
      ExternalIDsByPlatform: _req["ExternalIDsByPlatform"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /GetBlame
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2552815)
   *
   * Get blame of the given line range.
   */
  GetBlame(req, options) {
    const _req = req;
    const url = this.genBaseURL("/GetBlame");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      Revision: _req["Revision"],
      Path: _req["Path"],
      StartLine: _req["StartLine"],
      EndLine: _req["EndLine"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /ListProtectedBranches
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2606097)
   */
  ListProtectedBranches(req, options) {
    const _req = req;
    const url = this.genBaseURL("/ListProtectedBranches");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      PageNumber: _req["PageNumber"],
      PageSize: _req["PageSize"],
      selector: _req["selector"],
      Query: _req["Query"],
      ReviewRulesetId: _req["ReviewRulesetId"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /ListFilePaths
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2635429)
   *
   * Get a list of filepaths.
   */
  ListFilePaths(req, options) {
    const _req = req;
    const url = this.genBaseURL("/ListFilePaths");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      Revision: _req["Revision"],
      Query: _req["Query"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /BatchGetMergeRequests
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2644926)
   */
  BatchGetMergeRequests(req, options) {
    const _req = req;
    const url = this.genBaseURL("/BatchGetMergeRequests");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      Ids: _req["Ids"],
      Numbers: _req["Numbers"],
      Selector: _req["Selector"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /CheckBranchPermission
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2647910)
   */
  CheckBranchPermission(req, options) {
    const _req = req;
    const url = this.genBaseURL("/CheckBranchPermission");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      BranchAction: _req["BranchAction"],
      BranchName: _req["BranchName"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /ListBranches
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2653166)
   *
   * Search or list branches.
   */
  ListBranches(req, options) {
    const _req = req;
    const url = this.genBaseURL("/ListBranches");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      Query: _req["Query"],
      Type: _req["Type"],
      PageNumber: _req["PageNumber"],
      PageSize: _req["PageSize"],
      QueryMode: _req["QueryMode"],
      CommitId: _req["CommitId"],
      SortBy: _req["SortBy"],
      SortOrder: _req["SortOrder"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /InstallApp
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2663760)
   */
  InstallApp(req, options) {
    const _req = req;
    const url = this.genBaseURL("/InstallApp");
    const method = "POST";
    const data = {
      TargetType: _req["TargetType"],
      TargetId: _req["TargetId"],
      AppId: _req["AppId"],
      DisableWebhook: _req["DisableWebhook"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /UninstallApp
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2663761)
   */
  UninstallApp(req, options) {
    const _req = req;
    const url = this.genBaseURL("/UninstallApp");
    const method = "POST";
    const data = {
      TargetType: _req["TargetType"],
      TargetId: _req["TargetId"],
      AppId: _req["AppId"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /ListInstalledApps
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2663762)
   */
  ListInstalledApps(req, options) {
    const _req = req;
    const url = this.genBaseURL("/ListInstalledApps");
    const method = "POST";
    const data = {
      TargetType: _req["TargetType"],
      TargetId: _req["TargetId"],
      WithInheritance: _req["WithInheritance"],
      WithAvatarURL: _req["WithAvatarURL"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /CreateMergeRequestBypasses
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2697163)
   */
  CreateMergeRequestBypasses(req, options) {
    const _req = req;
    const url = this.genBaseURL("/CreateMergeRequestBypasses");
    const method = "POST";
    const data = {
      MergeRequestId: _req["MergeRequestId"],
      CommitId: _req["CommitId"],
      Inputs: _req["Inputs"],
      RepoId: _req["RepoId"],
      MergeRequestNumber: _req["MergeRequestNumber"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /ListMergeRequestConflicts
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2731612)
   *
   * List merge request conflict infos.
   */
  ListMergeRequestConflicts(req, options) {
    const _req = req;
    const url = this.genBaseURL("/ListMergeRequestConflicts");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      Id: _req["Id"],
      Number: _req["Number"],
      WithContent: _req["WithContent"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /GetMergeRequestConflict
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2732467)
   *
   * Get merge request conflict info.
   */
  GetMergeRequestConflict(req, options) {
    const _req = req;
    const url = this.genBaseURL("/GetMergeRequestConflict");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      Id: _req["Id"],
      Number: _req["Number"],
      ConflictsId: _req["ConflictsId"],
      FirstPath: _req["FirstPath"],
      SecondPath: _req["SecondPath"],
      WithContent: _req["WithContent"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /ResolveMergeRequestConflicts
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2737200)
   *
   * Resolve merge request conflict.
   */
  ResolveMergeRequestConflicts(req, options) {
    const _req = req;
    const url = this.genBaseURL("/ResolveMergeRequestConflicts");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      Id: _req["Id"],
      Number: _req["Number"],
      CommitMessage: _req["CommitMessage"],
      Resolutions: _req["Resolutions"],
      ConflictsId: _req["ConflictsId"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /CanResolveMergeRequestConflictsInUI
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2839206)
   *
   * Check current can resolve merge request conflict in ui.
   */
  CanResolveMergeRequestConflictsInUI(req, options) {
    const _req = req;
    const url = this.genBaseURL("/CanResolveMergeRequestConflictsInUI");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      Id: _req["Id"],
      Number: _req["Number"],
      ChangeId: _req["ChangeId"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /ListTags
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2898892)
   *
   * Search or list tags.
   */
  ListTags(req, options) {
    const _req = req;
    const url = this.genBaseURL("/ListTags");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      Query: _req["Query"],
      PageNumber: _req["PageNumber"],
      PageSize: _req["PageSize"],
      CommitId: _req["CommitId"],
      QueryMode: _req["QueryMode"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /ListRepositories
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2900525)
   *
   * 获取仓库列表
   */
  ListRepositories(req, options) {
    const _req = req || {};
    const url = this.genBaseURL("/ListRepositories");
    const method = "POST";
    const data = {
      Query: _req["Query"],
      PageNumber: _req["PageNumber"],
      PageSize: _req["PageSize"],
      Starred: _req["Starred"],
      NamespaceId: _req["NamespaceId"],
      Statuses: _req["Statuses"],
      ContributedById: _req["ContributedById"],
      StarredById: _req["StarredById"],
      Selector: _req["Selector"],
      SortBy: _req["SortBy"],
      SortOrder: _req["SortOrder"],
      HasWiki: _req["HasWiki"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /CherryPick
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2903389)
   *
   * Cherry pick a commit to target branch
   */
  CherryPick(req, options) {
    const _req = req;
    const url = this.genBaseURL("/CherryPick");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      TargetBranch: _req["TargetBranch"],
      CommitId: _req["CommitId"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /Revert
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2927868)
   *
   * Revert a commit to target branch
   */
  Revert(req, options) {
    const _req = req;
    const url = this.genBaseURL("/Revert");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      TargetBranch: _req["TargetBranch"],
      CommitId: _req["CommitId"],
      CommitMessage: _req["CommitMessage"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /ListUserBriefs
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2939027)
   *
   * 搜索用户简易数据 (作为 Open API 使用)
   */
  ListUserBriefs(req, options) {
    const _req = req || {};
    const url = this.genBaseURL("/ListUserBriefs");
    const method = "POST";
    const data = {
      PageNumber: _req["PageNumber"],
      PageSize: _req["PageSize"],
      Usernames: _req["Usernames"],
      UserIds: _req["UserIds"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /UpdateLabel
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2939634)
   */
  UpdateLabel(req, options) {
    const _req = req;
    const url = this.genBaseURL("/UpdateLabel");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      Id: _req["Id"],
      Name: _req["Name"],
      Color: _req["Color"],
      Description: _req["Description"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /DeleteLabel
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2939635)
   */
  DeleteLabel(req, options) {
    const _req = req;
    const url = this.genBaseURL("/DeleteLabel");
    const method = "POST";
    const data = { RepoId: _req["RepoId"], Id: _req["Id"] };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /UpdateLabelPriority
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2939636)
   */
  UpdateLabelPriority(req, options) {
    const _req = req;
    const url = this.genBaseURL("/UpdateLabelPriority");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      Id: _req["Id"],
      AfterLabelId: _req["AfterLabelId"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /UpdateMergeRequestLabels
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2939637)
   */
  UpdateMergeRequestLabels(req, options) {
    const _req = req;
    const url = this.genBaseURL("/UpdateMergeRequestLabels");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      MergeRequestId: _req["MergeRequestId"],
      AddLabelIds: _req["AddLabelIds"],
      RemoveLabelIds: _req["RemoveLabelIds"],
      SetLabelIds: _req["SetLabelIds"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /ListLabels
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2939638)
   */
  ListLabels(req, options) {
    const _req = req;
    const url = this.genBaseURL("/ListLabels");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      Ids: _req["Ids"],
      Selector: _req["Selector"],
      Names: _req["Names"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /CreateLabel
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2939639)
   */
  CreateLabel(req, options) {
    const _req = req;
    const url = this.genBaseURL("/CreateLabel");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      Name: _req["Name"],
      Color: _req["Color"],
      Description: _req["Description"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /UpdateBranch
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=2975840)
   */
  UpdateBranch(req, options) {
    const _req = req;
    const url = this.genBaseURL("/UpdateBranch");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      BranchName: _req["BranchName"],
      NewCommitId: _req["NewCommitId"],
      OldCommitId: _req["OldCommitId"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /GetSelf
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=3021561)
   *
   * 获取当前用户
   */
  GetSelf(req, options) {
    const url = this.genBaseURL("/GetSelf");
    const method = "POST";
    return this.request({ url, method }, options);
  }
  /**
   * POST /GetApp
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=3021562)
   *
   * For apps, some fields will be ignored and the app itself will be returned.
   */
  GetApp(req, options) {
    const _req = req || {};
    const url = this.genBaseURL("/GetApp");
    const method = "POST";
    const data = {
      Id: _req["Id"],
      Name: _req["Name"],
      Properties: _req["Properties"],
      PropertyNames: _req["PropertyNames"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /CreateWikiVersion
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=3043317)
   */
  CreateWikiVersion(req, options) {
    const _req = req;
    const url = this.genBaseURL("/CreateWikiVersion");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      BaseVersionId: _req["BaseVersionId"],
      NewContentsByPath: _req["NewContentsByPath"],
      PathsToRemove: _req["PathsToRemove"],
      CommitId: _req["CommitId"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /ListWikiVersions
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=3043318)
   */
  ListWikiVersions(req, options) {
    const _req = req;
    const url = this.genBaseURL("/ListWikiVersions");
    const method = "POST";
    const data = { RepoId: _req["RepoId"], Selector: _req["Selector"] };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /ListWikiFilePaths
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=3043319)
   */
  ListWikiFilePaths(req, options) {
    const _req = req;
    const url = this.genBaseURL("/ListWikiFilePaths");
    const method = "POST";
    const data = { RepoId: _req["RepoId"], VersionId: _req["VersionId"] };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /GetWikiFile
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=3043320)
   */
  GetWikiFile(req, options) {
    const _req = req;
    const url = this.genBaseURL("/GetWikiFile");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      VersionId: _req["VersionId"],
      Path: _req["Path"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /CompleteChat
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=3197025)
   */
  CompleteChat(req, options) {
    const _req = req;
    const url = this.genBaseURL("/CompleteChat");
    const method = "POST";
    const data = {
      History: _req["History"],
      RepoId: _req["RepoId"],
      CommitId: _req["CommitId"],
      AdditionalInstructions: _req["AdditionalInstructions"],
      DisableReplaceTool: _req["DisableReplaceTool"],
      DisableEditTool: _req["DisableEditTool"],
      DisableBashTool: _req["DisableBashTool"],
      DisableSemanticSymbolSearchTool: _req["DisableSemanticSymbolSearchTool"],
      DisabledToolNames: _req["DisabledToolNames"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /SendCopilotTaskMessage
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=3253038)
   */
  SendCopilotTaskMessage(req, options) {
    const _req = req;
    const url = this.genBaseURL("/SendCopilotTaskMessage");
    const method = "POST";
    const data = {
      Message: _req["Message"],
      TaskId: _req["TaskId"],
      RepoId: _req["RepoId"],
      CommitId: _req["CommitId"],
      MergeRequestNumber: _req["MergeRequestNumber"],
      ModelName: _req["ModelName"],
      Branch: _req["Branch"],
      AgentName: _req["AgentName"],
      Environment: _req["Environment"],
      MCPServers: _req["MCPServers"],
      Hooks: _req["Hooks"],
      Models: _req["Models"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /ListCopilotTasks
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=3253039)
   */
  ListCopilotTasks(req, options) {
    const _req = req || {};
    const url = this.genBaseURL("/ListCopilotTasks");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      Statuses: _req["Statuses"],
      Title: _req["Title"],
      PageNumber: _req["PageNumber"],
      PageSize: _req["PageSize"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /ListCopilotTaskEvents
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=3253040)
   */
  ListCopilotTaskEvents(req, options) {
    const _req = req;
    const url = this.genBaseURL("/ListCopilotTaskEvents");
    const method = "POST";
    const data = { TaskId: _req["TaskId"] };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /CreateIssue
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=3303629)
   */
  CreateIssue(req, options) {
    const _req = req;
    const url = this.genBaseURL("/CreateIssue");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      Title: _req["Title"],
      Description: _req["Description"],
      AssigneeIds: _req["AssigneeIds"],
      ParentIssueId: _req["ParentIssueId"],
      LabelIds: _req["LabelIds"],
      DueDate: _req["DueDate"],
      Status: _req["Status"],
      LinkedMergeRequestIds: _req["LinkedMergeRequestIds"],
      MilestoneId: _req["MilestoneId"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /GetIssue
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=3303630)
   */
  GetIssue(req, options) {
    const _req = req;
    const url = this.genBaseURL("/GetIssue");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      Id: _req["Id"],
      Number: _req["Number"],
      Selector: _req["Selector"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /DeleteIssue
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=3303631)
   */
  DeleteIssue(req, options) {
    const _req = req;
    const url = this.genBaseURL("/DeleteIssue");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      Id: _req["Id"],
      Number: _req["Number"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /UpdateIssue
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=3303633)
   */
  UpdateIssue(req, options) {
    const _req = req;
    const url = this.genBaseURL("/UpdateIssue");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      Id: _req["Id"],
      Number: _req["Number"],
      Title: _req["Title"],
      Description: _req["Description"],
      Status: _req["Status"],
      DueDate: _req["DueDate"],
      AssigneeIds: _req["AssigneeIds"],
      ParentIssueId: _req["ParentIssueId"],
      MilestoneId: _req["MilestoneId"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /UpdateIssueLabels
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=3307671)
   */
  UpdateIssueLabels(req, options) {
    const _req = req;
    const url = this.genBaseURL("/UpdateIssueLabels");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      IssueId: _req["IssueId"],
      AddLabelIds: _req["AddLabelIds"],
      RemoveLabelIds: _req["RemoveLabelIds"],
      SetLabelIds: _req["SetLabelIds"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /GetCopilotTask
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=3308890)
   */
  GetCopilotTask(req, options) {
    const _req = req;
    const url = this.genBaseURL("/GetCopilotTask");
    const method = "POST";
    const data = { TaskId: _req["TaskId"] };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /SearchRepositories
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=3321410)
   */
  SearchRepositories(req, options) {
    const _req = req || {};
    const url = this.genBaseURL("/SearchRepositories");
    const method = "POST";
    const data = {
      Filter: _req["Filter"],
      SortBy: _req["SortBy"],
      SortOrder: _req["SortOrder"],
      PageToken: _req["PageToken"],
      PageSize: _req["PageSize"],
      Selector: _req["Selector"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /SearchMergeRequests
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=3321411)
   */
  SearchMergeRequests(req, options) {
    const _req = req;
    const url = this.genBaseURL("/SearchMergeRequests");
    const method = "POST";
    const data = {
      Filter: _req["Filter"],
      SortBy: _req["SortBy"],
      SortOrder: _req["SortOrder"],
      PageToken: _req["PageToken"],
      PageSize: _req["PageSize"],
      Selector: _req["Selector"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /ListPrompts
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=3352498)
   */
  ListPrompts(req, options) {
    const _req = req || {};
    const url = this.genBaseURL("/ListPrompts");
    const method = "POST";
    const data = { RepoId: _req["RepoId"] };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /GetPrompt
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=3352499)
   */
  GetPrompt(req, options) {
    const _req = req;
    const url = this.genBaseURL("/GetPrompt");
    const method = "POST";
    const data = {
      Name: _req["Name"],
      Arguments: _req["Arguments"],
      PositionalArguments: _req["PositionalArguments"],
      RepoId: _req["RepoId"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /DeleteCopilotTask
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=3353874)
   */
  DeleteCopilotTask(req, options) {
    const _req = req;
    const url = this.genBaseURL("/DeleteCopilotTask");
    const method = "POST";
    const data = { TaskId: _req["TaskId"] };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /ListCopilotModels
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=3354531)
   */
  ListCopilotModels(req, options) {
    const url = this.genBaseURL("/ListCopilotModels");
    const method = "POST";
    return this.request({ url, method }, options);
  }
  /**
   * POST /CreateDraftComment
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=3363436)
   */
  CreateDraftComment(req, options) {
    const _req = req;
    const url = this.genBaseURL("/CreateDraftComment");
    const method = "POST";
    const data = {
      CommentableType: _req["CommentableType"],
      CommentableId: _req["CommentableId"],
      RepoId: _req["RepoId"],
      CommitId: _req["CommitId"],
      ThreadId: _req["ThreadId"],
      Content: _req["Content"],
      Position: _req["Position"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /PublishDraftComments
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=3363437)
   */
  PublishDraftComments(req, options) {
    const _req = req;
    const url = this.genBaseURL("/PublishDraftComments");
    const method = "POST";
    const data = {
      CommentableType: _req["CommentableType"],
      CommentableId: _req["CommentableId"],
      ReviewContent: _req["ReviewContent"],
      RepoId: _req["RepoId"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /SearchIssues
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=3378562)
   */
  SearchIssues(req, options) {
    const _req = req || {};
    const url = this.genBaseURL("/SearchIssues");
    const method = "POST";
    const data = {
      Filter: _req["Filter"],
      SortBy: _req["SortBy"],
      SortOrder: _req["SortOrder"],
      PageToken: _req["PageToken"],
      PageSize: _req["PageSize"],
      Selector: _req["Selector"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /CreateRelease
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=3404490)
   */
  CreateRelease(req, options) {
    const _req = req;
    const url = this.genBaseURL("/CreateRelease");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      TagName: _req["TagName"],
      Description: _req["Description"],
      TagRevision: _req["TagRevision"],
      TagMessage: _req["TagMessage"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /GetRelease
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=3404491)
   */
  GetRelease(req, options) {
    const _req = req;
    const url = this.genBaseURL("/GetRelease");
    const method = "POST";
    const data = { RepoId: _req["RepoId"], TagName: _req["TagName"] };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /UpdateRelease
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=3404492)
   */
  UpdateRelease(req, options) {
    const _req = req;
    const url = this.genBaseURL("/UpdateRelease");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      TagName: _req["TagName"],
      Description: _req["Description"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /SendEventFromAgent
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=3418954)
   */
  SendEventFromAgent(req, options) {
    const _req = req;
    const url = this.genBaseURL("/SendEventFromAgent");
    const method = "POST";
    const data = { Event: _req["Event"], TaskId: _req["TaskId"] };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /SearchGroupedIssues
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=3451511)
   */
  SearchGroupedIssues(req, options) {
    const _req = req;
    const url = this.genBaseURL("/SearchGroupedIssues");
    const method = "POST";
    const data = {
      Filter: _req["Filter"],
      GroupBy: _req["GroupBy"],
      GroupOrder: _req["GroupOrder"],
      SortBy: _req["SortBy"],
      SortOrder: _req["SortOrder"],
      Selector: _req["Selector"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /SearchRepoIssues
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=3464965)
   */
  SearchRepoIssues(req, options) {
    const _req = req;
    const url = this.genBaseURL("/SearchRepoIssues");
    const method = "POST";
    const data = {
      RepoId: _req["RepoId"],
      Filter: _req["Filter"],
      SortBy: _req["SortBy"],
      SortOrder: _req["SortOrder"],
      PageNumber: _req["PageNumber"],
      PageSize: _req["PageSize"],
      Selector: _req["Selector"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /SubscribeCopilotTaskEvents
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=3476427)
   */
  SubscribeCopilotTaskEvents(req, options) {
    const _req = req;
    const url = this.genBaseURL("/SubscribeCopilotTaskEvents");
    const method = "POST";
    const data = { TaskId: _req["TaskId"], EventOffset: _req["EventOffset"] };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /ListSubagents
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=3508377)
   */
  ListSubagents(req, options) {
    const _req = req || {};
    const url = this.genBaseURL("/ListSubagents");
    const method = "POST";
    const data = { RepoId: _req["RepoId"] };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /CheckLarkAuth
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=3525768)
   *
   * 检查用户是否对 lark 操作进行了授权
   */
  CheckLarkAuth(req, options) {
    const _req = req;
    const url = this.genBaseURL("/CheckLarkAuth");
    const method = "POST";
    const data = { OriginURL: _req["OriginURL"] };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /GetMergeBase
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=3525770)
   *
   * Get the merge base of multiple revisions.
   */
  GetMergeBase(req, options) {
    const _req = req;
    const url = this.genBaseURL("/GetMergeBase");
    const method = "POST";
    const data = { RepoId: _req["RepoId"], Revisions: _req["Revisions"] };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /ShareCopilotTask
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=3558409)
   */
  ShareCopilotTask(req, options) {
    const _req = req;
    const url = this.genBaseURL("/ShareCopilotTask");
    const method = "POST";
    const data = { TaskId: _req["TaskId"] };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /ListWebhookSettings
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=3576153)
   */
  ListWebhookSettings(req, options) {
    const _req = req;
    const url = this.genBaseURL("/ListWebhookSettings");
    const method = "POST";
    const data = {
      TargetType: _req["TargetType"],
      TargetId: _req["TargetId"],
      WithInheritance: _req["WithInheritance"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /UpdateWebhook
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=3576154)
   */
  UpdateWebhook(req, options) {
    const _req = req;
    const url = this.genBaseURL("/UpdateWebhook");
    const method = "POST";
    const data = {
      Id: _req["Id"],
      URL: _req["URL"],
      Secret: _req["Secret"],
      EnableSSLVerification: _req["EnableSSLVerification"],
      Events: _req["Events"],
      Status: _req["Status"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /EnableWebhook
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=3576155)
   *
   * 重新enable一个被禁用的webhook
   */
  EnableWebhook(req, options) {
    const _req = req;
    const url = this.genBaseURL("/EnableWebhook");
    const method = "POST";
    const data = { Id: _req["Id"] };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /GetWebhook
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=3576156)
   */
  GetWebhook(req, options) {
    const _req = req;
    const url = this.genBaseURL("/GetWebhook");
    const method = "POST";
    const data = { Id: _req["Id"] };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /CreateWebhook
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=3576157)
   */
  CreateWebhook(req, options) {
    const _req = req;
    const url = this.genBaseURL("/CreateWebhook");
    const method = "POST";
    const data = {
      URL: _req["URL"],
      Secret: _req["Secret"],
      EnableSSLVerification: _req["EnableSSLVerification"],
      Events: _req["Events"],
      TargetType: _req["TargetType"],
      TargetId: _req["TargetId"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /DeleteWebhook
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=3576158)
   */
  DeleteWebhook(req, options) {
    const _req = req;
    const url = this.genBaseURL("/DeleteWebhook");
    const method = "POST";
    const data = { Id: _req["Id"] };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /GetUserStatistics
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=3581926)
   *
   * 获取用户统计数据
   */
  GetUserStatistics(req, options) {
    const _req = req || {};
    const url = this.genBaseURL("/GetUserStatistics");
    const method = "POST";
    const data = {
      UserId: _req["UserId"],
      Username: _req["Username"],
      RelativeDays: _req["RelativeDays"],
      NaturalYear: _req["NaturalYear"],
      Selector: _req["Selector"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /CountUserActivitiesByDate
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=3582520)
   */
  CountUserActivitiesByDate(req, options) {
    const _req = req;
    const url = this.genBaseURL("/CountUserActivitiesByDate");
    const method = "POST";
    const data = {
      Username: _req["Username"],
      TenantId: _req["TenantId"],
      BeginDate: _req["BeginDate"],
      EndDate: _req["EndDate"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /ListReviewNetworkStatistics
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=3582521)
   *
   * List review network edges
   */
  ListReviewNetworkStatistics(req, options) {
    const _req = req || {};
    const url = this.genBaseURL("/ListReviewNetworkStatistics");
    const method = "POST";
    const data = {
      AuthorId: _req["AuthorId"],
      AuthorUsername: _req["AuthorUsername"],
      ReviewerId: _req["ReviewerId"],
      ReviewerUsername: _req["ReviewerUsername"],
      TopN: _req["TopN"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /TriggerWikiGeneration
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=3594533)
   */
  TriggerWikiGeneration(req, options) {
    const _req = req;
    const url = this.genBaseURL("/TriggerWikiGeneration");
    const method = "POST";
    const data = { RepoId: _req["RepoId"] };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /SubscribeCopilotSessionACPEvents
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=3716125)
   */
  SubscribeCopilotSessionACPEvents(req, options) {
    const _req = req;
    const url = this.genBaseURL("/SubscribeCopilotSessionACPEvents");
    const method = "POST";
    const data = { sessionId: _req["sessionId"] };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /GetEnvironment
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=3722750)
   *
   * Get environment by id.
   */
  GetEnvironment(req, options) {
    const _req = req;
    const url = this.genBaseURL("/GetEnvironment");
    const method = "POST";
    const data = { Id: _req["Id"] };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /DeleteEnvironment
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=3722752)
   *
   * Delete environment by id.
   */
  DeleteEnvironment(req, options) {
    const _req = req;
    const url = this.genBaseURL("/DeleteEnvironment");
    const method = "POST";
    const data = { Id: _req["Id"] };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /CopilotACPRequest
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=3747323)
   */
  CopilotACPRequest(req, options) {
    const _req = req;
    const url = this.genBaseURL("/CopilotACPRequest");
    const method = "POST";
    const data = { method: _req["method"], params: _req["params"] };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /UploadCopilotACPEvent
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=3770235)
   */
  CopilotACPUploadEvents(req, options) {
    const _req = req;
    const url = this.genBaseURL("/UploadCopilotACPEvent");
    const method = "POST";
    const data = { Events: _req["Events"], SessionId: _req["SessionId"] };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /UploadCopilotSession
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=3770236)
   */
  CopilotACPUploadSession(req, options) {
    const _req = req;
    const url = this.genBaseURL("/UploadCopilotSession");
    const method = "POST";
    const data = { Session: _req["Session"] };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /ListEnvironments
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=3777970)
   *
   * List environments by labels (flexible filters).
   */
  ListEnvironments(req, options) {
    const _req = req || {};
    const url = this.genBaseURL("/ListEnvironments");
    const method = "POST";
    const data = { RepoId: _req["RepoId"], Labels: _req["Labels"] };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /CreateEnvironment
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=3777971)
   *
   * Create a new environment.
   */
  CreateEnvironment(req, options) {
    const _req = req;
    const url = this.genBaseURL("/CreateEnvironment");
    const method = "POST";
    const data = {
      Name: _req["Name"],
      Description: _req["Description"],
      Labels: _req["Labels"],
      Annotations: _req["Annotations"],
      Image: _req["Image"],
      Variables: _req["Variables"],
      Secrets: _req["Secrets"],
      ContainerCaching: _req["ContainerCaching"],
      TTL: _req["TTL"],
      Scripts: _req["Scripts"],
      RepoId: _req["RepoId"],
      Default: _req["Default"],
      Repos: _req["Repos"],
      Cwd: _req["Cwd"]
    };
    return this.request({ url, method, data }, options);
  }
  /**
   * POST /UpdateEnvironment
   *
   * [jump to BAM](https://cloud.bytedance.net/bam/rd/codebase.app.openapi/api_doc/show_doc?version=1.0.323&endpoint_id=3777972)
   *
   * Update environment (partial updates).
   */
  UpdateEnvironment(req, options) {
    const _req = req;
    const url = this.genBaseURL("/UpdateEnvironment");
    const method = "POST";
    const data = {
      Id: _req["Id"],
      Name: _req["Name"],
      Description: _req["Description"],
      Labels: _req["Labels"],
      Annotations: _req["Annotations"],
      Image: _req["Image"],
      Variables: _req["Variables"],
      Secrets: _req["Secrets"],
      ContainerCaching: _req["ContainerCaching"],
      TTL: _req["TTL"],
      Scripts: _req["Scripts"],
      RepoId: _req["RepoId"],
      Default: _req["Default"],
      Repos: _req["Repos"],
      Cwd: _req["Cwd"]
    };
    return this.request({ url, method, data }, options);
  }
};
var createNodeHttpFetch = async () => {
  const https = await import("https");
  const http = await import("http");
  const { URL: URL2 } = await import("url");
  return (url, init) => {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL2(url);
      const isHttps = parsedUrl.protocol === "https:";
      const lib = isHttps ? https : http;
      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (isHttps ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method: init?.method || "GET",
        headers: init?.headers || {}
      };
      const req = lib.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => data += chunk);
        res.on("end", () => {
          resolve({
            json: () => Promise.resolve(JSON.parse(data))
          });
        });
      });
      req.on("error", reject);
      if (init?.body) {
        req.write(init.body);
      }
      req.end();
    });
  };
};
var getFetch = async () => {
  if (typeof globalThis.fetch === "function") {
    return globalThis.fetch;
  }
  return createNodeHttpFetch();
};
var NextCode = class extends CodebaseAppOpenapiService {
  requesterFn;
  fetchFn = null;
  constructor(options) {
    const requestFn = async (params, serviceOptions) => {
      return this.requesterFn(
        {
          ...params,
          headers: {
            "Content-Type": "application/json",
            ...options.userJwt ? { "X-Code-User-JWT": options.userJwt } : {},
            ...options.pat ? { Authorization: `Bearer ${options.pat}` } : {},
            ...options.appId ? { "X-Code-App-ID": options.appId } : {},
            ...options.appSecret ? { "X-Code-App-Secret": options.appSecret } : {},
            ...options.ztiToken ? { "X-Code-ZTI-Token": options.ztiToken } : {},
            ...params.headers
          }
        },
        serviceOptions
      );
    };
    super({
      request: requestFn,
      baseURL: (path) => {
        return `https://codebase-api.byted.org/v2/?Action=${path.replace(
          "/",
          ""
        )}`;
      }
    });
    this.requesterFn = options.requesterFn ?? this.defaultRequesterFn;
  }
  async defaultRequesterFn(params) {
    if (!this.fetchFn) {
      this.fetchFn = await getFetch();
    }
    return this.fetchFn(params.url, {
      method: params.method,
      headers: {
        "Content-Type": "application/json",
        ...params.headers
      },
      body: params.data ? JSON.stringify(params.data) : void 0
    }).then((res) => res.json());
  }
};

// utils/cli-utils.ts
function requireArg(value, name) {
  if (!value) {
    throw new Error(`Missing ${name}.`);
  }
  return value;
}
function parseBoolean(value, fallback) {
  if (value === void 0) {
    return fallback;
  }
  const normalized = value.trim().toLowerCase();
  if (normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "y") {
    return true;
  }
  if (normalized === "false" || normalized === "0" || normalized === "no" || normalized === "n") {
    return false;
  }
  throw new Error(`Invalid boolean value: ${value}`);
}
function parseNumber(value, name) {
  if (value === void 0) {
    return void 0;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid ${name}: ${value}`);
  }
  return parsed;
}
function parsePositiveInt(value, name, range = {}) {
  if (value === void 0) {
    return void 0;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || !Number.isInteger(parsed)) {
    throw new Error(`Invalid ${name}: ${value}`);
  }
  if (range.min !== void 0 && parsed < range.min) {
    throw new Error(`${name} must be >= ${range.min}.`);
  }
  if (range.max !== void 0 && parsed > range.max) {
    throw new Error(`${name} must be <= ${range.max}.`);
  }
  return parsed;
}
function parseCsv(value) {
  if (!value) {
    return void 0;
  }
  const items = value.split(",").map((item) => item.trim()).filter(Boolean);
  return items.length > 0 ? items : void 0;
}
function unwrapResult(response) {
  if (!response || typeof response !== "object") {
    return response;
  }
  const typed = response;
  if ("Result" in typed) {
    if (typed.Result !== void 0) {
      return typed.Result;
    }
    const error = typed.ResponseMetadata?.Error;
    if (error) {
      const message = [error.Code, error.Message].filter(Boolean).join(": ");
      throw new Error(message ? `Request failed: ${message}` : "Request failed.");
    }
    throw new Error("Request failed: missing Result.");
  }
  if (typed.ResponseMetadata?.Error) {
    const error = typed.ResponseMetadata.Error;
    const message = [error.Code, error.Message].filter(Boolean).join(": ");
    throw new Error(message ? `Request failed: ${message}` : "Request failed.");
  }
  return response;
}
function printResult(result) {
  if (result === void 0) {
    return;
  }
  if (result && typeof result === "object" && "Result" in result) {
    console.log(JSON.stringify(result.Result, null, 2));
    return;
  }
  console.log(JSON.stringify(result, null, 2));
}

// commands/constants.ts
var DEFAULT_PAGE_NUMBER = 1;
var DEFAULT_PAGE_SIZE = 20;
var REPO_PATH_HINT = "Defaults to repoPath parsed from git remote origin via getRepoName.";

// utils/git-utils.ts
var import_node_child_process = require("node:child_process");
function getCurrentBranch() {
  try {
    return (0, import_node_child_process.execSync)("git rev-parse --abbrev-ref HEAD").toString().trim();
  } catch (error) {
    console.warn("Could not detect git branch.");
    return "";
  }
}
function getRepoName() {
  try {
    const remoteUrl = (0, import_node_child_process.execSync)("git remote get-url origin", { encoding: "utf-8" }).trim();
    let repoPath = remoteUrl;
    if (remoteUrl.startsWith("git@")) {
      repoPath = remoteUrl.split(":").pop() ?? remoteUrl;
    } else if (remoteUrl.startsWith("http")) {
      try {
        const urlObj = new URL(remoteUrl);
        repoPath = urlObj.pathname;
      } catch (error) {
        repoPath = remoteUrl;
      }
    }
    if (repoPath.startsWith("/")) {
      repoPath = repoPath.substring(1);
    }
    if (repoPath.endsWith(".git")) {
      repoPath = repoPath.slice(0, -4);
    }
    return repoPath;
  } catch (error) {
    console.warn("Could not detect git repo name.");
    return null;
  }
}
function resolveRepoPath(value, fallback = getRepoName) {
  if (value) {
    return value;
  }
  const repoPath = fallback();
  if (!repoPath) {
    throw new Error(
      "Missing repoPath. Provide repoPath or configure git remote origin (repoPath is parsed from git URL via getRepoName)."
    );
  }
  return repoPath;
}

// commands/repo.ts
async function getCurrentBranchInfo() {
  return { branch: getCurrentBranch() };
}
async function getRepoNameInfo() {
  const repoPath = getRepoName();
  if (!repoPath) {
    throw new Error("Could not detect repo name. Ensure git remote origin exists.");
  }
  return { repoPath };
}
async function getRepositoryInfo(nextcode2, repoPathInput, withPermissionsInput) {
  const repoPath = resolveRepoPath(repoPathInput);
  const withPermissions = parseBoolean(withPermissionsInput);
  const request = {
    Path: repoPath
  };
  if (withPermissions !== void 0) {
    request.WithPermissions = withPermissions;
  }
  return nextcode2.GetRepository(request);
}
async function listRepositories(nextcode2, query, pageNumberInput, pageSizeInput, starredInput, sortBy, sortOrder) {
  const pageNumber = parsePositiveInt(pageNumberInput, "pageNumber", { min: 1 }) ?? DEFAULT_PAGE_NUMBER;
  const pageSize = parsePositiveInt(pageSizeInput, "pageSize", { min: 1, max: 100 }) ?? DEFAULT_PAGE_SIZE;
  const starred = parseBoolean(starredInput);
  const request = {
    PageNumber: pageNumber,
    PageSize: pageSize
  };
  if (query) {
    request.Query = query;
  }
  if (starred !== void 0) {
    request.Starred = starred;
  }
  if (sortBy) {
    request.SortBy = sortBy;
  }
  if (sortOrder) {
    request.SortOrder = sortOrder;
  }
  return nextcode2.ListRepositories(request);
}
async function getCommit(nextcode2, revision, repoPathInput) {
  const repoId = await resolveRepoId(nextcode2, repoPathInput);
  return nextcode2.GetCommit({
    RepoId: repoId,
    Revision: requireArg(revision, "revision")
  });
}
async function listCommits(nextcode2, revision, path, pageNumberInput, pageSizeInput, query, repoPathInput) {
  const pageNumber = parsePositiveInt(pageNumberInput, "pageNumber", { min: 1 }) ?? DEFAULT_PAGE_NUMBER;
  const pageSize = parsePositiveInt(pageSizeInput, "pageSize", { min: 1, max: 100 }) ?? DEFAULT_PAGE_SIZE;
  const repoId = await resolveRepoId(nextcode2, repoPathInput);
  const request = {
    RepoId: repoId,
    Revision: requireArg(revision, "revision"),
    PageNumber: pageNumber,
    PageSize: pageSize
  };
  if (path) {
    request.Path = path;
  }
  if (query) {
    request.Query = query;
  }
  return nextcode2.ListCommits(request);
}
async function getFile(nextcode2, revision, path, repoPathInput) {
  const repoId = await resolveRepoId(nextcode2, repoPathInput);
  return nextcode2.GetFile({
    RepoId: repoId,
    Revision: requireArg(revision, "revision"),
    Path: requireArg(path, "path")
  });
}
async function createOrUpdateFiles(nextcode2, branch, commitMessage, filesJson, startBranch, repoPathInput) {
  const repoId = await resolveRepoId(nextcode2, repoPathInput);
  let actions;
  try {
    actions = JSON.parse(requireArg(filesJson, "files"));
  } catch {
    throw new Error("Invalid files JSON. Expected an array of CommitFilesAction objects.");
  }
  if (!Array.isArray(actions) || actions.length === 0) {
    throw new Error("files must be a non-empty array of CommitFilesAction objects.");
  }
  const request = {
    RepoId: repoId,
    Branch: requireArg(branch, "branch"),
    CommitMessage: requireArg(commitMessage, "commitMessage"),
    CommitFilesActions: actions
  };
  if (startBranch) {
    request.StartBranch = startBranch;
  }
  return nextcode2.CreateCommit(request);
}
async function resolveRepoIdFromPath(nextcode2, repoPathInput) {
  const repoPath = resolveRepoPath(repoPathInput);
  const repoResponse = await getRepositoryInfo(nextcode2, repoPath);
  const repoResult = unwrapResult(repoResponse);
  const repoId = repoResult.Repository?.Id;
  if (!repoId) {
    throw new Error(`Could not resolve repoId for ${repoPath}.`);
  }
  return repoId;
}
async function updateRepositoryInfo(nextcode2, repoPathInput, name, description) {
  const repoId = await resolveRepoIdFromPath(nextcode2, repoPathInput);
  const request = {
    RepoId: repoId
  };
  if (name) {
    request.Name = name;
  }
  if (description !== void 0) {
    request.Desc = description;
  }
  return nextcode2.UpdateRepository(request);
}
function registerRepoCommands(program3, nextcode2, execute2) {
  const repoProgram = program3.command("repo").description("Repository operations");
  repoProgram.command("current-branch").description("Get the current git branch.").action(() => execute2(() => getCurrentBranchInfo()));
  repoProgram.command("name").description("Get the current repository path (parsed from git remote origin via getRepoName).").action(() => execute2(() => getRepoNameInfo()));
  repoProgram.command("get").description("Get repository details (repoPath defaults to git remote origin via getRepoName).").option("--repo-path <repoPath>", `Repository path. ${REPO_PATH_HINT}`).option("--with-permissions <boolean>", "Include permissions").action(function() {
    const options = this.opts();
    return execute2(
      () => getRepositoryInfo(nextcode2, options.repoPath, options.withPermissions)
    );
  });
  repoProgram.command("list").description("List repositories with optional filters.").option("--query <query>", "Search query").option("--page-number <pageNumber>", "Page number").option("--page-size <pageSize>", "Page size").option("--starred <boolean>", "Only starred repositories").option("--sort-by <sortBy>", "Sort field").option("--sort-order <sortOrder>", "Sort order (Asc/Desc)").action(function() {
    const options = this.opts();
    return execute2(
      () => listRepositories(
        nextcode2,
        options.query,
        options.pageNumber,
        options.pageSize,
        options.starred,
        options.sortBy,
        options.sortOrder
      )
    );
  });
  repoProgram.command("get-commit").description("Get a specific commit by revision.").requiredOption("--revision <revision>", "Commit revision (sha, branch, tag)").option("--repo-path <repoPath>", `Repository path. ${REPO_PATH_HINT}`).action(function() {
    const options = this.opts();
    return execute2(() => getCommit(nextcode2, options.revision, options.repoPath));
  });
  repoProgram.command("list-commits").description("List commits for a revision.").requiredOption("--revision <revision>", "Commit revision (sha, branch, tag)").option("--path <path>", "File path filter").option("--page-number <pageNumber>", "Page number").option("--page-size <pageSize>", "Page size").option("--query <query>", "Search query").option("--repo-path <repoPath>", `Repository path. ${REPO_PATH_HINT}`).action(function() {
    const options = this.opts();
    return execute2(
      () => listCommits(
        nextcode2,
        options.revision,
        options.path,
        options.pageNumber,
        options.pageSize,
        options.query,
        options.repoPath
      )
    );
  });
  repoProgram.command("get-file").description("Get file info and content from repository.").requiredOption("--revision <revision>", "Commit revision (sha, branch, tag)").requiredOption("--path <path>", "File path").option("--repo-path <repoPath>", `Repository path. ${REPO_PATH_HINT}`).action(function() {
    const options = this.opts();
    return execute2(
      () => getFile(nextcode2, options.revision, options.path, options.repoPath)
    );
  });
  repoProgram.command("create-or-update-files").description("Create or update files in repository via commit.").requiredOption("--branch <branch>", "Target branch").requiredOption("--commit-message <message>", "Commit message").requiredOption(
    "--files <json>",
    "JSON array of CommitFilesAction objects [{ActionType,Path,Content}]"
  ).option("--start-branch <branch>", "Start branch (create branch from this)").option("--repo-path <repoPath>", `Repository path. ${REPO_PATH_HINT}`).action(function() {
    const options = this.opts();
    return execute2(
      () => createOrUpdateFiles(
        nextcode2,
        options.branch,
        options.commitMessage,
        options.files,
        options.startBranch,
        options.repoPath
      )
    );
  });
  repoProgram.command("update").description("Update repository metadata.").option("--name <name>", "Repository name").option("--description <description>", "Repository description").option("--repo-path <repoPath>", `Repository path. ${REPO_PATH_HINT}`).action(function() {
    const options = this.opts();
    return execute2(
      () => updateRepositoryInfo(nextcode2, options.repoPath, options.name, options.description)
    );
  });
}

// commands/repo-resolver.ts
async function resolveRepoId(nextcode2, repoPathInput) {
  const repoPath = resolveRepoPath(repoPathInput);
  const repoResponse = await getRepositoryInfo(nextcode2, repoPath);
  const repoResult = unwrapResult(repoResponse);
  const repoId = repoResult.Repository?.Id;
  if (!repoId) {
    throw new Error(`Could not resolve repoId for ${repoPath}.`);
  }
  return repoId;
}

// commands/branch.ts
async function getDefaultBranch(nextcode2, repoPathInput) {
  const repoId = await resolveRepoId(nextcode2, repoPathInput);
  return nextcode2.GetDefaultBranch({ RepoId: repoId });
}
async function createBranch(nextcode2, name, revision, repoPathInput) {
  const repoId = await resolveRepoId(nextcode2, repoPathInput);
  return nextcode2.CreateBranch({
    RepoId: repoId,
    Name: requireArg(name, "name"),
    Revision: requireArg(revision, "revision")
  });
}
async function listBranches(nextcode2, query, pageNumberInput, pageSizeInput, repoPathInput) {
  const pageNumber = parsePositiveInt(pageNumberInput, "pageNumber", { min: 1 }) ?? DEFAULT_PAGE_NUMBER;
  const pageSize = parsePositiveInt(pageSizeInput, "pageSize", { min: 1, max: 100 }) ?? DEFAULT_PAGE_SIZE;
  const repoId = await resolveRepoId(nextcode2, repoPathInput);
  const request = {
    RepoId: repoId,
    Type: "all",
    PageNumber: pageNumber,
    PageSize: pageSize
  };
  if (query) {
    request.Query = query;
  }
  return nextcode2.ListBranches(request);
}
async function deleteBranch(nextcode2, name, repoPathInput) {
  const repoId = await resolveRepoId(nextcode2, repoPathInput);
  return nextcode2.DeleteBranch({
    RepoId: repoId,
    Name: requireArg(name, "name")
  });
}
function registerBranchCommands(program3, nextcode2, execute2) {
  const branchProgram = program3.command("branch").description("Branch operations");
  branchProgram.command("default").description("Get default branch.").option("--repo-path <repoPath>", `Repository path. ${REPO_PATH_HINT}`).action(function() {
    const options = this.opts();
    return execute2(() => getDefaultBranch(nextcode2, options.repoPath));
  });
  branchProgram.command("create").description("Create a branch.").requiredOption("--name <name>", "Branch name").requiredOption("--revision <revision>", "Branch revision").option("--repo-path <repoPath>", `Repository path. ${REPO_PATH_HINT}`).action(function() {
    const options = this.opts();
    return execute2(
      () => createBranch(nextcode2, options.name, options.revision, options.repoPath)
    );
  });
  branchProgram.command("list").description("List branches.").option("--query <query>", "Branch query").option("--page-number <pageNumber>", "Page number").option("--page-size <pageSize>", "Page size").option("--repo-path <repoPath>", `Repository path. ${REPO_PATH_HINT}`).action(function() {
    const options = this.opts();
    return execute2(
      () => listBranches(
        nextcode2,
        options.query,
        options.pageNumber,
        options.pageSize,
        options.repoPath
      )
    );
  });
  branchProgram.command("delete").description("Delete a branch.").requiredOption("--name <name>", "Branch name").option("--repo-path <repoPath>", `Repository path. ${REPO_PATH_HINT}`).action(function() {
    const options = this.opts();
    return execute2(() => deleteBranch(nextcode2, options.name, options.repoPath));
  });
}

// commands/runner-log.ts
var BITS_BASE_URL = "https://bits.bytedance.net/api/v1";
var JOB_STATUS_SUCCESS = 1;
var DEFAULT_LOG_PAGE_SIZE = 2e4;
var DEFAULT_LOG_TAIL_LINES = 2e3;
function coercePositiveInt(value, name, range = {}) {
  if (value === void 0) {
    return void 0;
  }
  return parsePositiveInt(String(value), name, range);
}
function getBitsHeaders() {
  const token = process.env.TMATES_JWT;
  if (!token) {
    throw new Error("TMATES_JWT is required to fetch runner logs.");
  }
  return {
    accept: "application/json, text/plain, */*",
    "x-jwt-token": token
  };
}
async function bitsRequest(url, description) {
  const response = await fetch(url, {
    headers: getBitsHeaders(),
    method: "GET"
  });
  if (!response.ok) {
    throw new Error(
      `Bits API error (${description}): ${response.status} ${response.statusText}`
    );
  }
  return response.json();
}
async function fetchJobRunDetail(jobRunId, pipelineRunId) {
  const params = new URLSearchParams({
    needLogs: "true",
    needOutputs: "false",
    replaceVars: "true"
  });
  if (pipelineRunId !== void 0) {
    params.set("pipelineRunId", String(pipelineRunId));
  }
  const url = `${BITS_BASE_URL}/p/job_runs/${jobRunId}?${params.toString()}`;
  console.log("url", url);
  const data = await bitsRequest(url, `get job run detail ${jobRunId}`);
  return data;
}
async function fetchStepLog(jobRunId, jobRunSeq, step, pageSize, tailLines) {
  if (!step.orcaStepUid || step.id === void 0) {
    throw new Error("Step info missing id or orcaStepUid.");
  }
  const url = `${BITS_BASE_URL}/p/job_runs/${jobRunId}/step_logs/${step.orcaStepUid}?pageNum=1&pageSize=${pageSize}&runSeq=${jobRunSeq}&stepId=${step.id}`;
  const data = await bitsRequest(url, `get step log ${step.name ?? step.id}`);
  const logResult = data;
  const logs = logResult.stepLog?.logs ?? [];
  const tailLogs = logs.slice(-tailLines);
  const logLines = tailLogs.map((line) => line.message ?? "");
  return {
    stepId: step.id,
    stepName: step.name,
    totalLines: logs.length,
    logs: logLines,
    truncated: logs.length > tailLines
  };
}
function selectTargetSteps(steps, input) {
  if (steps.length === 0) {
    throw new Error("No steps found in job run.");
  }
  const selectors = [
    input.stepId ? "stepId" : null,
    input.stepName ? "stepName" : null,
    input.stepIndex !== void 0 ? "stepIndex" : null
  ].filter(Boolean);
  if (input.allSteps && selectors.length > 0) {
    throw new Error("Use allSteps without stepId, stepName, or stepIndex.");
  }
  if (selectors.length > 1) {
    throw new Error("Use only one of stepId, stepName, or stepIndex.");
  }
  if (input.stepId) {
    const matched = steps.find(
      (step) => step.id !== void 0 && String(step.id) === String(input.stepId)
    );
    if (!matched) {
      throw new Error(`Step id not found: ${input.stepId}`);
    }
    return { selection: "step-id", steps: [matched] };
  }
  if (input.stepName) {
    const matches = steps.filter((step) => step.name === input.stepName);
    if (matches.length === 0) {
      throw new Error(`Step name not found: ${input.stepName}`);
    }
    if (matches.length > 1) {
      throw new Error(
        `Multiple steps named ${input.stepName}. Use stepId or stepIndex.`
      );
    }
    return { selection: "step-name", steps: matches };
  }
  if (input.stepIndex !== void 0) {
    if (input.stepIndex < 0 || input.stepIndex >= steps.length) {
      throw new Error(`stepIndex out of range: ${input.stepIndex}`);
    }
    return { selection: "step-index", steps: [steps[input.stepIndex]] };
  }
  if (input.allSteps) {
    return { selection: "all-steps", steps };
  }
  const stepsWithFailType = steps.filter((step) => step.failType !== void 0);
  if (stepsWithFailType.length > 0) {
    const successValue = stepsWithFailType.some((step) => step.failType === 0) ? 0 : JOB_STATUS_SUCCESS;
    const failedSteps = stepsWithFailType.filter(
      (step) => step.failType !== successValue
    );
    if (failedSteps.length > 0) {
      return { selection: "failed-steps", steps: failedSteps };
    }
  }
  return { selection: "last-step", steps: [steps[steps.length - 1]] };
}
async function getRunnerLog(input) {
  const jobRunId = requireArg(input.jobRunId, "jobRunId");
  const jobRunSeq = coercePositiveInt(input.jobRunSeq, "jobRunSeq", { min: 1 });
  const pipelineRunId = input.pipelineRunId;
  const stepId = input.stepId;
  const stepName = input.stepName;
  const stepIndex = coercePositiveInt(input.stepIndex, "stepIndex", { min: 0 });
  const allSteps = input.allSteps ?? false;
  const tailLines = coercePositiveInt(input.tailLines, "tailLines", { min: 1 }) ?? DEFAULT_LOG_TAIL_LINES;
  const pageSize = coercePositiveInt(input.pageSize, "pageSize", {
    min: 1,
    max: DEFAULT_LOG_PAGE_SIZE
  }) ?? DEFAULT_LOG_PAGE_SIZE;
  const jobRunDetail = await fetchJobRunDetail(jobRunId, pipelineRunId);
  const jobRun = jobRunDetail.jobRun;
  const steps = jobRun?.stepInfos ?? [];
  if (steps.length === 0) {
    throw new Error("No steps found in job run. Provide pipelineRunId if available.");
  }
  const resolvedJobRunSeq = coercePositiveInt(
    jobRun?.runSeq ?? jobRun?.jobRunSeq ?? jobRunSeq,
    "jobRunSeq",
    { min: 1 }
  );
  if (!resolvedJobRunSeq) {
    throw new Error(
      "Missing jobRunSeq in job run detail. Provide jobRunSeq or pipelineRunId."
    );
  }
  const { selection, steps: targetSteps } = selectTargetSteps(steps, {
    stepId,
    stepName,
    stepIndex,
    allSteps
  });
  const stepLogs = [];
  for (const step of targetSteps) {
    stepLogs.push(
      await fetchStepLog(jobRunId, resolvedJobRunSeq, step, pageSize, tailLines)
    );
  }
  const result = {
    jobRunId,
    jobRunSeq: resolvedJobRunSeq,
    selection,
    steps: stepLogs
  };
  if (pipelineRunId !== void 0) {
    result.pipelineRunId = pipelineRunId;
  }
  return result;
}
function registerRunnerLogCommands(program3, execute2) {
  const runnerProgram = program3.command("runner-log").description("Runner log operations");
  runnerProgram.command("get").description("Get runner logs for a job run.").requiredOption("--job-run-id <id>", "Job run id").option("--job-run-seq <seq>", "Job run sequence").option("--pipeline-run-id <id>", "Pipeline run id").option("--step-id <id>", "Fetch log for a specific step id").option("--step-name <name>", "Fetch log for a specific step name").option("--step-index <index>", "Fetch log for a specific step index").option("--all-steps", "Fetch logs for all steps").option("--tail-lines <lines>", "Tail lines count").option("--page-size <size>", "Page size for log lines").action(function() {
    const opts = this.opts();
    return execute2(
      () => getRunnerLog({
        jobRunId: opts.jobRunId,
        jobRunSeq: opts.jobRunSeq,
        pipelineRunId: opts.pipelineRunId,
        stepId: opts.stepId,
        stepName: opts.stepName,
        stepIndex: opts.stepIndex,
        allSteps: opts.allSteps,
        tailLines: opts.tailLines,
        pageSize: opts.pageSize
      })
    );
  });
}

// commands/check-run.ts
function parseDateTime(value) {
  if (!value) {
    return 0;
  }
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}
function pickLatestCheckRun(checkRuns) {
  return [...checkRuns].sort((a, b) => {
    return parseDateTime(b.UpdatedAt) - parseDateTime(a.UpdatedAt);
  })[0];
}
function pickLatestMergeRequestVersion(versions) {
  if (!versions || versions.length === 0) {
    return void 0;
  }
  return [...versions].sort((a, b) => a.Number - b.Number)[versions.length - 1];
}
function isFailedCheckRun(checkRun) {
  if (checkRun.Status !== "completed") {
    return false;
  }
  const conclusion = checkRun.Conclusion;
  return Boolean(conclusion && conclusion !== "succeeded");
}
function getCheckRunLogText(checkRun) {
  return [checkRun.Text, checkRun.TextHTML, checkRun.Description].filter(Boolean).join("\n");
}
function extractLeafboatJobIds(text) {
  const pattern = /Leafboat Job ID\s*[:|]\s*(\d+)/gi;
  const jobIds = /* @__PURE__ */ new Set();
  let match;
  while ((match = pattern.exec(text)) !== null) {
    jobIds.add(match[1]);
  }
  return Array.from(jobIds);
}
async function resolveBranchCommitId(nextcode2, repoId, branch) {
  const branchResponse = await nextcode2.GetBranch({
    RepoId: repoId,
    Name: branch
  });
  const branchResult = unwrapResult(branchResponse);
  const commitId = branchResult.Branch?.Commit?.Id;
  if (!commitId) {
    throw new Error(`Could not resolve commit for branch ${branch}.`);
  }
  return commitId;
}
async function findMergeRequestByBranch(nextcode2, repoPath, branch, status) {
  const filter = {
    RepoPath: repoPath,
    SourceBranch: branch
  };
  if (status) {
    filter.Status = status;
  }
  const searchResponse = await nextcode2.SearchMergeRequests({
    Filter: filter,
    SortBy: "UpdatedAt",
    SortOrder: "Desc",
    PageSize: 1
  });
  const searchResult = unwrapResult(searchResponse);
  const mergeRequest = searchResult.MergeRequests?.[0];
  if (!mergeRequest) {
    throw new Error(`No merge request found for ${repoPath} branch ${branch}.`);
  }
  return mergeRequest;
}
async function getLatestCheckRunLogByBranch(nextcode2, branchInput, pageSizeInput, repoPathInput) {
  const branch = requireArg(branchInput, "branch");
  const pageSize = parsePositiveInt(pageSizeInput, "pageSize", { min: 1, max: 100 }) ?? 100;
  const repoId = await resolveRepoId(nextcode2, repoPathInput);
  const commitId = await resolveBranchCommitId(nextcode2, repoId, branch);
  const listResponse = await nextcode2.ListCheckRuns({
    RepoId: repoId,
    CommitId: commitId,
    PageNumber: 1,
    PageSize: pageSize
  });
  const listResult = unwrapResult(listResponse);
  const latestCheckRun = pickLatestCheckRun(listResult.CheckRuns ?? []);
  if (!latestCheckRun) {
    throw new Error(`No check runs found for branch ${branch}.`);
  }
  return {
    checkRun: latestCheckRun,
    log: latestCheckRun.Text || latestCheckRun.Description || "",
    logHtml: latestCheckRun.TextHTML || "",
    detailsUrl: latestCheckRun.DetailsURL ?? ""
  };
}
async function getMergeRequestChecklistLogs(nextcode2, branchInput, pageSizeInput, repoPathInput, statusInput) {
  const branch = requireArg(branchInput, "branch");
  const pageSize = parsePositiveInt(pageSizeInput, "pageSize", { min: 1, max: 100 }) ?? 100;
  const repoPath = resolveRepoPath(repoPathInput);
  const repoId = await resolveRepoId(nextcode2, repoPath);
  const mergeRequest = await findMergeRequestByBranch(
    nextcode2,
    repoPath,
    branch,
    statusInput
  );
  const mergeRequestResponse = await nextcode2.GetMergeRequest({
    RepoId: repoId,
    Id: mergeRequest.Id,
    Selector: {
      Branch: true,
      Version: true,
      URL: true
    }
  });
  const mergeRequestResult = unwrapResult(
    mergeRequestResponse
  );
  const detailedMergeRequest = mergeRequestResult.MergeRequest;
  if (!detailedMergeRequest) {
    throw new Error(`Failed to load merge request ${mergeRequest.Id}.`);
  }
  const latestVersion = pickLatestMergeRequestVersion(
    detailedMergeRequest.Versions ?? []
  );
  const commitId = latestVersion?.SourceCommitId ?? detailedMergeRequest.SourceBranch?.Commit?.Id ?? await resolveBranchCommitId(nextcode2, repoId, branch);
  const listResponse = await nextcode2.ListCheckRuns({
    RepoId: repoId,
    CommitId: commitId,
    MergeRequestId: detailedMergeRequest.Id,
    PageNumber: 1,
    PageSize: pageSize
  });
  const listResult = unwrapResult(listResponse);
  const checkRuns = listResult.CheckRuns ?? [];
  const failedCheckRuns = checkRuns.filter(isFailedCheckRun);
  const failedResults = [];
  for (const checkRun of failedCheckRuns) {
    let logText = getCheckRunLogText(checkRun);
    let jobIds = extractLeafboatJobIds(logText);
    if (jobIds.length === 0) {
      const detailResponse = await nextcode2.GetCheckRun({
        Id: checkRun.Id,
        RepoId: repoId
      });
      const detailResult = unwrapResult(detailResponse);
      const detailedCheckRun = detailResult.CheckRun;
      if (detailedCheckRun) {
        logText = getCheckRunLogText(detailedCheckRun);
        jobIds = extractLeafboatJobIds(logText);
      }
    }
    const runnerLogs = [];
    for (const jobRunId of jobIds) {
      runnerLogs.push(await getRunnerLog({ jobRunId }));
    }
    failedResults.push({
      checkRun: {
        id: checkRun.Id,
        name: checkRun.Name,
        status: checkRun.Status,
        conclusion: checkRun.Conclusion,
        updatedAt: checkRun.UpdatedAt,
        detailsUrl: checkRun.DetailsURL ?? ""
      },
      leafboatJobIds: jobIds,
      runnerLogs
    });
  }
  return {
    repoPath,
    branch,
    mergeRequest: {
      id: detailedMergeRequest.Id,
      number: detailedMergeRequest.Number,
      title: detailedMergeRequest.Title,
      url: detailedMergeRequest.URL,
      sourceBranch: detailedMergeRequest.SourceBranchName,
      targetBranch: detailedMergeRequest.TargetBranchName
    },
    checklist: checkRuns.map((checkRun) => ({
      id: checkRun.Id,
      name: checkRun.Name,
      status: checkRun.Status,
      conclusion: checkRun.Conclusion,
      updatedAt: checkRun.UpdatedAt,
      detailsUrl: checkRun.DetailsURL ?? ""
    })),
    failedCheckRuns: failedResults
  };
}
async function createCheckRun(nextcode2, commitId, name, statusInput, conclusionInput, repoPathInput) {
  const repoId = await resolveRepoId(nextcode2, repoPathInput);
  const request = {
    RepoId: repoId,
    CommitId: requireArg(commitId, "commitId"),
    Name: requireArg(name, "name"),
    Status: requireArg(statusInput, "status")
  };
  if (conclusionInput) {
    request.Conclusion = conclusionInput;
  }
  return nextcode2.CreateCheckRun(request);
}
async function getCheckRun(nextcode2, checkRunId, repoPathInput) {
  const repoId = await resolveRepoId(nextcode2, repoPathInput);
  return nextcode2.GetCheckRun({
    Id: requireArg(checkRunId, "checkRunId"),
    RepoId: repoId
  });
}
async function updateCheckRun(nextcode2, checkRunId, status, conclusion, description, text, repoPathInput) {
  const repoId = await resolveRepoId(nextcode2, repoPathInput);
  const request = {
    Id: requireArg(checkRunId, "checkRunId"),
    RepoId: repoId
  };
  if (status) {
    request.Status = status;
  }
  if (conclusion) {
    request.Conclusion = conclusion;
  }
  if (description) {
    request.Description = description;
  }
  if (text) {
    request.Text = text;
  }
  return nextcode2.UpdateCheckRun(request);
}
async function listCheckRuns(nextcode2, commitId, pageNumberInput, pageSizeInput, repoPathInput) {
  const pageNumber = parsePositiveInt(pageNumberInput, "pageNumber", { min: 1 }) ?? DEFAULT_PAGE_NUMBER;
  const pageSize = parsePositiveInt(pageSizeInput, "pageSize", { min: 1, max: 100 }) ?? DEFAULT_PAGE_SIZE;
  const repoId = await resolveRepoId(nextcode2, repoPathInput);
  return nextcode2.ListCheckRuns({
    RepoId: repoId,
    CommitId: requireArg(commitId, "commitId"),
    PageNumber: pageNumber,
    PageSize: pageSize
  });
}
function registerCheckRunCommands(program3, nextcode2, execute2) {
  const checkRunProgram = program3.command("check-run").description("Check run operations");
  checkRunProgram.command("latest-log").description("Get latest check run log by branch.").requiredOption("--branch <branch>", "Branch name").option("--page-size <pageSize>", "Page size").option("--repo-path <repoPath>", `Repository path. ${REPO_PATH_HINT}`).action(function() {
    const options = this.opts();
    return execute2(
      () => getLatestCheckRunLogByBranch(
        nextcode2,
        options.branch,
        options.pageSize,
        options.repoPath
      )
    );
  });
  checkRunProgram.command("mr-checklist").description("Get merge request checklist and runner logs for failed check runs.").requiredOption("--branch <branch>", "Branch name").option("--page-size <pageSize>", "Page size").option("--repo-path <repoPath>", `Repository path. ${REPO_PATH_HINT}`).option("--mr-status <status>", "Merge request status filter (open/closed/merged)").action(function() {
    const options = this.opts();
    return execute2(
      () => getMergeRequestChecklistLogs(
        nextcode2,
        options.branch,
        options.pageSize,
        options.repoPath,
        options.mrStatus
      )
    );
  });
  checkRunProgram.command("create").description("Create a check run.").requiredOption("--commit-id <id>", "Commit id").requiredOption("--name <name>", "Check run name").requiredOption("--status <status>", "Check run status").option("--conclusion <conclusion>", "Check run conclusion").option("--repo-path <repoPath>", `Repository path. ${REPO_PATH_HINT}`).action(function() {
    const options = this.opts();
    return execute2(
      () => createCheckRun(
        nextcode2,
        options.commitId,
        options.name,
        options.status,
        options.conclusion,
        options.repoPath
      )
    );
  });
  checkRunProgram.command("get").description("Get a check run.").requiredOption("--check-run-id <id>", "Check run id").option("--repo-path <repoPath>", `Repository path. ${REPO_PATH_HINT}`).action(function() {
    const options = this.opts();
    return execute2(() => getCheckRun(nextcode2, options.checkRunId, options.repoPath));
  });
  checkRunProgram.command("update").description("Update a check run.").requiredOption("--check-run-id <id>", "Check run id").option("--status <status>", "Check run status").option("--conclusion <conclusion>", "Check run conclusion").option("--description <description>", "Check run description").option("--text <text>", "Check run text").option("--repo-path <repoPath>", `Repository path. ${REPO_PATH_HINT}`).action(function() {
    const options = this.opts();
    return execute2(
      () => updateCheckRun(
        nextcode2,
        options.checkRunId,
        options.status,
        options.conclusion,
        options.description,
        options.text,
        options.repoPath
      )
    );
  });
  checkRunProgram.command("list").description("List check runs.").requiredOption("--commit-id <id>", "Commit id").option("--page-number <pageNumber>", "Page number").option("--page-size <pageSize>", "Page size").option("--repo-path <repoPath>", `Repository path. ${REPO_PATH_HINT}`).action(function() {
    const options = this.opts();
    return execute2(
      () => listCheckRuns(
        nextcode2,
        options.commitId,
        options.pageNumber,
        options.pageSize,
        options.repoPath
      )
    );
  });
}

// commands/comment.ts
function parseMergeRequestUrl(value) {
  const raw = value.trim();
  const normalized = raw.includes("://") ? raw : `https://code.byted.org/${raw.replace(/^\/+/, "")}`;
  let url;
  try {
    url = new URL(normalized);
  } catch (error) {
    throw new Error(`Invalid merge request URL: ${value}`);
  }
  const segments = url.pathname.replace(/^\/+/, "").split("/").filter(Boolean);
  const mrIndex = segments.findIndex((segment) => segment === "merge_requests");
  if (mrIndex <= 0 || mrIndex >= segments.length - 1) {
    throw new Error(
      "Invalid merge request URL path. Expected /<group>/<repo>/merge_requests/<number>."
    );
  }
  const repoPath = segments.slice(0, mrIndex).join("/");
  const number = Number(segments[mrIndex + 1]);
  if (!Number.isInteger(number)) {
    throw new Error(`Invalid merge request number in URL: ${segments[mrIndex + 1]}`);
  }
  return { repoPath, number };
}
async function resolveMergeRequestIdFromUrl(nextcode2, mergeRequestUrlInput) {
  const mergeRequestUrl = requireArg(mergeRequestUrlInput, "mergeRequestUrl");
  const { repoPath, number } = parseMergeRequestUrl(mergeRequestUrl);
  const repoId = await resolveRepoId(nextcode2, repoPath);
  const mergeRequestResponse = await nextcode2.GetMergeRequest({
    RepoId: repoId,
    Number: number
  });
  const mergeRequestResult = unwrapResult(mergeRequestResponse);
  const mergeRequestId = mergeRequestResult.MergeRequest?.Id;
  if (!mergeRequestId) {
    throw new Error(`Merge request not found for URL: ${mergeRequestUrl}`);
  }
  return {
    repoId,
    mergeRequestId
  };
}
async function createComment(nextcode2, commentableTypeInput, commentableIdInput, contentInput, repoPathInput) {
  const repoId = await resolveRepoId(nextcode2, repoPathInput);
  const commentableType = requireArg(
    commentableTypeInput,
    "commentableType"
  );
  const commentableId = requireArg(commentableIdInput, "commentableId");
  const content = requireArg(contentInput, "content");
  const request = {
    RepoId: repoId,
    CommentableType: commentableType,
    Content: content
  };
  if (commentableType === "commit") {
    request.CommitId = commentableId;
  } else {
    request.CommentableId = commentableId;
  }
  return nextcode2.CreateComment(request);
}
async function getComment(nextcode2, commentId, repoPathInput) {
  const repoId = await resolveRepoId(nextcode2, repoPathInput);
  return nextcode2.GetComment({
    Id: requireArg(commentId, "commentId"),
    RepoId: repoId
  });
}
async function listCommentThreads(nextcode2, commentableTypeInput, commentableIdInput, commitIdInput, repoPathInput) {
  const repoId = await resolveRepoId(nextcode2, repoPathInput);
  const commentableType = requireArg(
    commentableTypeInput,
    "commentableType"
  );
  const commentableId = requireArg(commentableIdInput, "commentableId");
  const request = {
    RepoId: repoId,
    CommentableType: commentableType,
    CommentableId: commentableId
  };
  if (commitIdInput) {
    request.CommitId = commitIdInput;
  }
  return nextcode2.ListThreads(request);
}
async function listCommentThreadsByMergeRequestUrl(nextcode2, mergeRequestUrlInput, commitIdInput) {
  const { repoId, mergeRequestId } = await resolveMergeRequestIdFromUrl(
    nextcode2,
    mergeRequestUrlInput
  );
  const request = {
    RepoId: repoId,
    CommentableType: "merge_request",
    CommentableId: mergeRequestId
  };
  if (commitIdInput) {
    request.CommitId = commitIdInput;
  }
  return nextcode2.ListThreads(request);
}
async function updateComment(nextcode2, commentId, contentInput, repoPathInput) {
  const repoId = await resolveRepoId(nextcode2, repoPathInput);
  return nextcode2.UpdateComment({
    Id: requireArg(commentId, "commentId"),
    RepoId: repoId,
    Content: requireArg(contentInput, "content")
  });
}
async function deleteComment(nextcode2, commentId, repoPathInput) {
  const repoId = await resolveRepoId(nextcode2, repoPathInput);
  const request = {
    Id: requireArg(commentId, "commentId"),
    RepoId: repoId
  };
  return nextcode2.DeleteComment(request);
}
function registerCommentCommands(program3, nextcode2, execute2) {
  const commentProgram = program3.command("comment").description("Comment operations");
  commentProgram.command("create").description("Create a comment.").requiredOption("--commentable-type <type>", "Commentable type (merge_request/commit)").requiredOption(
    "--commentable-id <id>",
    "Commentable id or commit id (when type=commit)"
  ).requiredOption("--content <content>", "Comment content").option("--repo-path <repoPath>", `Repository path. ${REPO_PATH_HINT}`).action(function() {
    const options = this.opts();
    return execute2(
      () => createComment(
        nextcode2,
        options.commentableType,
        options.commentableId,
        options.content,
        options.repoPath
      )
    );
  });
  commentProgram.command("get").description("Get a comment.").requiredOption("--comment-id <id>", "Comment id").option("--repo-path <repoPath>", `Repository path. ${REPO_PATH_HINT}`).action(function() {
    const options = this.opts();
    return execute2(() => getComment(nextcode2, options.commentId, options.repoPath));
  });
  commentProgram.command("list").description("List comment threads by commentable target.").requiredOption("--commentable-type <type>", "Commentable type (merge_request/commit)").requiredOption(
    "--commentable-id <id>",
    "Commentable id or commit id (when type=commit)"
  ).option("--commit-id <id>", "Commit id for thread position filtering").option("--repo-path <repoPath>", `Repository path. ${REPO_PATH_HINT}`).action(function() {
    const options = this.opts();
    return execute2(
      () => listCommentThreads(
        nextcode2,
        options.commentableType,
        options.commentableId,
        options.commitId,
        options.repoPath
      )
    );
  });
  commentProgram.command("by-url").description("List merge request comment threads by merge request URL.").requiredOption("--merge-request-url <url>", "Merge request URL").option("--commit-id <id>", "Commit id for thread position filtering").action(function() {
    const options = this.opts();
    return execute2(
      () => listCommentThreadsByMergeRequestUrl(
        nextcode2,
        options.mergeRequestUrl,
        options.commitId
      )
    );
  });
  commentProgram.command("update").description("Update a comment.").requiredOption("--comment-id <id>", "Comment id").requiredOption("--content <content>", "Comment content").option("--repo-path <repoPath>", `Repository path. ${REPO_PATH_HINT}`).action(function() {
    const options = this.opts();
    return execute2(
      () => updateComment(nextcode2, options.commentId, options.content, options.repoPath)
    );
  });
  commentProgram.command("delete").description("Delete a comment.").requiredOption("--comment-id <id>", "Comment id").option("--repo-path <repoPath>", `Repository path. ${REPO_PATH_HINT}`).action(function() {
    const options = this.opts();
    return execute2(() => deleteComment(nextcode2, options.commentId, options.repoPath));
  });
}

// commands/diff.ts
function applyDiffFileOptions(request, options) {
  if (options.files) {
    request.Files = options.files;
  }
  if (options.ignoreWhitespaces !== void 0) {
    request.IgnoreWhitespaces = options.ignoreWhitespaces;
  }
  if (options.context !== void 0) {
    request.Context = options.context;
  }
  if (options.maxPatchBytes !== void 0) {
    request.MaxPatchBytes = options.maxPatchBytes;
  }
}
function parseMergeRequestUrl2(value) {
  const raw = value.trim();
  const normalized = raw.includes("://") ? raw : `https://code.byted.org/${raw.replace(/^\/+/, "")}`;
  let url;
  try {
    url = new URL(normalized);
  } catch (error) {
    throw new Error(`Invalid merge request URL: ${value}`);
  }
  const segments = url.pathname.replace(/^\/+/, "").split("/").filter(Boolean);
  const mrIndex = segments.findIndex((segment) => segment === "merge_requests");
  if (mrIndex <= 0 || mrIndex >= segments.length - 1) {
    throw new Error(
      "Invalid merge request URL path. Expected /<group>/<repo>/merge_requests/<number>."
    );
  }
  const repoPath = segments.slice(0, mrIndex).join("/");
  const number = Number(segments[mrIndex + 1]);
  if (!Number.isInteger(number)) {
    throw new Error(`Invalid merge request number in URL: ${segments[mrIndex + 1]}`);
  }
  return { repoPath, number };
}
async function resolveMergeRequestVersion(nextcode2, repoId, identifier) {
  if (!identifier.id && identifier.number === void 0) {
    throw new Error("Missing merge request identifier.");
  }
  const mergeResponse = await nextcode2.GetMergeRequest({
    RepoId: repoId,
    Id: identifier.id,
    Number: identifier.number,
    Selector: { Version: true }
  });
  const mergeResult = unwrapResult(
    mergeResponse
  );
  const mergeRequest = mergeResult.MergeRequest;
  const versions = mergeRequest?.Versions ?? [];
  const mergeRequestId = mergeRequest?.Id ?? identifier.id ?? String(identifier.number ?? "");
  if (!mergeRequestId) {
    throw new Error("Merge request not found.");
  }
  if (versions.length === 0) {
    throw new Error(`Merge request ${mergeRequestId} has no versions.`);
  }
  const latestVersion = versions[versions.length - 1];
  if (!latestVersion.BaseCommitId || !latestVersion.SourceCommitId) {
    throw new Error(`Merge request ${mergeRequestId} is missing version commit data.`);
  }
  return {
    repoId,
    mergeRequestId,
    baseCommitId: latestVersion.BaseCommitId,
    sourceCommitId: latestVersion.SourceCommitId
  };
}
async function resolveLatestMergeRequestVersion(nextcode2, repoId, sourceBranch, targetBranch) {
  const listResponse = await nextcode2.ListRepoMergeRequests({
    TargetRepoId: repoId,
    SourceBranch: sourceBranch,
    TargetBranch: targetBranch,
    PageNumber: 1,
    PageSize: 1,
    SortBy: "UpdatedAt",
    SortOrder: "Desc"
  });
  const listResult = unwrapResult(
    listResponse
  );
  const mergeRequest = listResult.MergeRequests[0];
  if (!mergeRequest?.Id) {
    throw new Error(`No merge request found for branch ${sourceBranch}.`);
  }
  return resolveMergeRequestVersion(nextcode2, repoId, { id: mergeRequest.Id });
}
async function listDiffCommits(nextcode2, fromCommit, toCommit, isStraightInput, pageNumberInput, pageSizeInput, withTotalCountInput, repoPathInput) {
  const isStraight = parseBoolean(isStraightInput, true) ?? true;
  const pageNumber = parsePositiveInt(pageNumberInput, "pageNumber", { min: 1 }) ?? DEFAULT_PAGE_NUMBER;
  const pageSize = parsePositiveInt(pageSizeInput, "pageSize", { min: 1, max: 100 }) ?? DEFAULT_PAGE_SIZE;
  const withTotalCount = parseBoolean(withTotalCountInput);
  const repoId = await resolveRepoId(nextcode2, repoPathInput);
  const request = {
    RepoId: repoId,
    FromCommit: requireArg(fromCommit, "fromCommit"),
    ToCommit: requireArg(toCommit, "toCommit"),
    IsStraight: isStraight,
    PageNumber: pageNumber,
    PageSize: pageSize
  };
  if (withTotalCount !== void 0) {
    request.WithTotalCount = withTotalCount;
  }
  return nextcode2.ListDiffCommits(request);
}
async function listDiffFiles(nextcode2, fromCommit, toCommit, isStraightInput, rawStatOnlyInput, repoPathInput) {
  const isStraight = parseBoolean(isStraightInput, true) ?? true;
  const rawStatOnly = parseBoolean(rawStatOnlyInput);
  const repoId = await resolveRepoId(nextcode2, repoPathInput);
  const request = {
    RepoId: repoId,
    FromCommit: requireArg(fromCommit, "fromCommit"),
    ToCommit: requireArg(toCommit, "toCommit"),
    IsStraight: isStraight
  };
  if (rawStatOnly !== void 0) {
    request.RawStatOnly = rawStatOnly;
  }
  return nextcode2.ListDiffFiles(request);
}
async function listDiffFileContents(nextcode2, fromCommit, toCommit, isStraightInput, filesInput, ignoreWhitespacesInput, contextInput, maxPatchBytesInput, repoPathInput) {
  const isStraight = parseBoolean(isStraightInput, true) ?? true;
  const files = parseCsv(filesInput);
  const ignoreWhitespaces = parseBoolean(ignoreWhitespacesInput);
  const context = parseNumber(contextInput, "context");
  const maxPatchBytes = parseNumber(maxPatchBytesInput, "maxPatchBytes");
  const repoId = await resolveRepoId(nextcode2, repoPathInput);
  const request = {
    RepoId: repoId,
    FromCommit: requireArg(fromCommit, "fromCommit"),
    ToCommit: requireArg(toCommit, "toCommit"),
    IsStraight: isStraight
  };
  applyDiffFileOptions(request, {
    files,
    ignoreWhitespaces,
    context,
    maxPatchBytes
  });
  return nextcode2.ListDiffFileContents(request);
}
async function listDiffFileContentsByBranch(nextcode2, sourceBranchInput, isStraightInput, filesInput, ignoreWhitespacesInput, contextInput, maxPatchBytesInput, targetBranch, repoPathInput) {
  const sourceBranch = requireArg(sourceBranchInput, "sourceBranch");
  const isStraight = parseBoolean(isStraightInput, true) ?? true;
  const files = parseCsv(filesInput);
  const ignoreWhitespaces = parseBoolean(ignoreWhitespacesInput);
  const context = parseNumber(contextInput, "context");
  const maxPatchBytes = parseNumber(maxPatchBytesInput, "maxPatchBytes");
  const repoId = await resolveRepoId(nextcode2, repoPathInput);
  const versionInfo = await resolveLatestMergeRequestVersion(
    nextcode2,
    repoId,
    sourceBranch,
    targetBranch
  );
  const request = {
    RepoId: versionInfo.repoId,
    FromCommit: versionInfo.baseCommitId,
    ToCommit: versionInfo.sourceCommitId,
    IsStraight: isStraight
  };
  applyDiffFileOptions(request, {
    files,
    ignoreWhitespaces,
    context,
    maxPatchBytes
  });
  return nextcode2.ListDiffFileContents(request);
}
async function listDiffFileContentsByUrl(nextcode2, mergeRequestUrl, isStraightInput, filesInput, ignoreWhitespacesInput, contextInput, maxPatchBytesInput) {
  const urlInput = requireArg(mergeRequestUrl, "mergeRequestUrl");
  const { repoPath, number } = parseMergeRequestUrl2(urlInput);
  const isStraight = parseBoolean(isStraightInput, true) ?? true;
  const files = parseCsv(filesInput);
  const ignoreWhitespaces = parseBoolean(ignoreWhitespacesInput);
  const context = parseNumber(contextInput, "context");
  const maxPatchBytes = parseNumber(maxPatchBytesInput, "maxPatchBytes");
  const repoId = await resolveRepoId(nextcode2, repoPath);
  const versionInfo = await resolveMergeRequestVersion(nextcode2, repoId, {
    number
  });
  const request = {
    RepoId: versionInfo.repoId,
    FromCommit: versionInfo.baseCommitId,
    ToCommit: versionInfo.sourceCommitId,
    IsStraight: isStraight
  };
  applyDiffFileOptions(request, {
    files,
    ignoreWhitespaces,
    context,
    maxPatchBytes
  });
  return nextcode2.ListDiffFileContents(request);
}
function registerDiffCommands(program3, nextcode2, execute2) {
  const diffProgram = program3.command("diff").description("Diff operations");
  diffProgram.command("commits").description("List diff commits.").requiredOption("--from-commit <commit>", "From commit").requiredOption("--to-commit <commit>", "To commit").option("--is-straight <boolean>", "Whether the diff is straight").option("--page-number <pageNumber>", "Page number").option("--page-size <pageSize>", "Page size").option("--with-total-count <boolean>", "Include total count").option("--repo-path <repoPath>", `Repository path. ${REPO_PATH_HINT}`).action(function() {
    const options = this.opts();
    return execute2(
      () => listDiffCommits(
        nextcode2,
        options.fromCommit,
        options.toCommit,
        options.isStraight,
        options.pageNumber,
        options.pageSize,
        options.withTotalCount,
        options.repoPath
      )
    );
  });
  diffProgram.command("files").description("List diff files.").requiredOption("--from-commit <commit>", "From commit").requiredOption("--to-commit <commit>", "To commit").option("--is-straight <boolean>", "Whether the diff is straight").option("--raw-stat-only <boolean>", "Return raw stat only").option("--repo-path <repoPath>", `Repository path. ${REPO_PATH_HINT}`).action(function() {
    const options = this.opts();
    return execute2(
      () => listDiffFiles(
        nextcode2,
        options.fromCommit,
        options.toCommit,
        options.isStraight,
        options.rawStatOnly,
        options.repoPath
      )
    );
  });
  diffProgram.command("contents").description("List diff file contents.").requiredOption("--from-commit <commit>", "From commit").requiredOption("--to-commit <commit>", "To commit").option("--is-straight <boolean>", "Whether the diff is straight").option("--files <paths>", "Comma-separated file paths").option("--ignore-whitespaces <boolean>", "Ignore whitespace changes").option("--context <lines>", "Context lines").option("--max-patch-bytes <bytes>", "Max patch bytes").option("--repo-path <repoPath>", `Repository path. ${REPO_PATH_HINT}`).action(function() {
    const options = this.opts();
    return execute2(
      () => listDiffFileContents(
        nextcode2,
        options.fromCommit,
        options.toCommit,
        options.isStraight,
        options.files,
        options.ignoreWhitespaces,
        options.context,
        options.maxPatchBytes,
        options.repoPath
      )
    );
  });
  diffProgram.command("by-branch").description("List diff file contents by branch.").requiredOption("--source-branch <branch>", "Source branch").option("--is-straight <boolean>", "Whether the diff is straight").option("--files <paths>", "Comma-separated file paths").option("--ignore-whitespaces <boolean>", "Ignore whitespace changes").option("--context <lines>", "Context lines").option("--max-patch-bytes <bytes>", "Max patch bytes").option("--repo-path <repoPath>", `Repository path. ${REPO_PATH_HINT}`).option("--target-branch <branch>", "Target branch for merge request lookup").action(function() {
    const options = this.opts();
    return execute2(
      () => listDiffFileContentsByBranch(
        nextcode2,
        options.sourceBranch,
        options.isStraight,
        options.files,
        options.ignoreWhitespaces,
        options.context,
        options.maxPatchBytes,
        options.targetBranch,
        options.repoPath
      )
    );
  });
  diffProgram.command("by-url").description("List diff file contents by merge request URL.").requiredOption("--merge-request-url <url>", "Merge request URL").option("--is-straight <boolean>", "Whether the diff is straight").option("--files <paths>", "Comma-separated file paths").option("--ignore-whitespaces <boolean>", "Ignore whitespace changes").option("--context <lines>", "Context lines").option("--max-patch-bytes <bytes>", "Max patch bytes").action(function() {
    const options = this.opts();
    return execute2(
      () => listDiffFileContentsByUrl(
        nextcode2,
        options.mergeRequestUrl,
        options.isStraight,
        options.files,
        options.ignoreWhitespaces,
        options.context,
        options.maxPatchBytes
      )
    );
  });
}

// commands/merge-request.ts
async function createMergeRequest(nextcode2, sourceBranch, targetBranch, title, description, mergeMethodInput, removeSourceBranchAfterMergeInput, squashCommitsInput, reviewerIdsInput, sourceRepoPathInput, targetRepoPathInput) {
  const mergeMethod = mergeMethodInput ?? "merge_commit";
  const removeSourceBranchAfterMerge = parseBoolean(removeSourceBranchAfterMergeInput, true) ?? true;
  const squashCommits = parseBoolean(squashCommitsInput, true) ?? true;
  const reviewerIds = parseCsv(reviewerIdsInput);
  const sourceRepoId = await resolveRepoId(nextcode2, sourceRepoPathInput);
  const targetRepoId = await resolveRepoId(
    nextcode2,
    targetRepoPathInput ?? sourceRepoPathInput
  );
  const resolvedSourceBranch = sourceBranch ?? getCurrentBranch();
  const request = {
    SourceRepoId: sourceRepoId,
    SourceBranch: resolvedSourceBranch,
    TargetRepoId: targetRepoId,
    TargetBranch: requireArg(targetBranch, "targetBranch"),
    Title: requireArg(title, "title"),
    MergeMethod: mergeMethod,
    RemoveSourceBranchAfterMerge: removeSourceBranchAfterMerge,
    SquashCommits: squashCommits
  };
  if (description) {
    request.Description = description;
  }
  if (reviewerIds) {
    request.ReviewerIds = reviewerIds;
  }
  return nextcode2.CreateMergeRequest(request);
}
async function getMergeRequest(nextcode2, mergeRequestId, withVersionInput, repoPathInput) {
  const withVersion = parseBoolean(withVersionInput);
  const repoId = await resolveRepoId(nextcode2, repoPathInput);
  const request = {
    RepoId: repoId,
    Id: requireArg(mergeRequestId, "mergeRequestId")
  };
  if (withVersion !== void 0) {
    request.Selector = {
      Version: withVersion
    };
  }
  return nextcode2.GetMergeRequest(request);
}
async function listMergeRequests(nextcode2, status, pageNumberInput, pageSizeInput, targetRepoPathInput) {
  const pageNumber = parsePositiveInt(pageNumberInput, "pageNumber", { min: 1 }) ?? DEFAULT_PAGE_NUMBER;
  const pageSize = parsePositiveInt(pageSizeInput, "pageSize", { min: 1, max: 100 }) ?? DEFAULT_PAGE_SIZE;
  const targetRepoId = await resolveRepoId(nextcode2, targetRepoPathInput);
  const request = {
    TargetRepoId: targetRepoId,
    PageNumber: pageNumber,
    PageSize: pageSize
  };
  if (status) {
    request.Status = status;
  }
  return nextcode2.ListRepoMergeRequests(request);
}
async function mergeMergeRequest(nextcode2, mergeRequestId, mergeMethod, removeSourceBranchAfterMergeInput, squashCommitsInput, mergeCommitMessage, squashCommitMessage, repoPathInput) {
  const removeSourceBranchAfterMerge = parseBoolean(removeSourceBranchAfterMergeInput);
  const squashCommits = parseBoolean(squashCommitsInput);
  const repoId = await resolveRepoId(nextcode2, repoPathInput);
  const request = {
    RepoId: repoId,
    Id: requireArg(mergeRequestId, "mergeRequestId")
  };
  if (mergeMethod) {
    request.MergeMethod = mergeMethod;
  }
  if (removeSourceBranchAfterMerge !== void 0) {
    request.RemoveSourceBranchAfterMerge = removeSourceBranchAfterMerge;
  }
  if (squashCommits !== void 0) {
    request.SquashCommits = squashCommits;
  }
  if (mergeCommitMessage) {
    request.MergeCommitMessage = mergeCommitMessage;
  }
  if (squashCommitMessage) {
    request.SquashCommitMessage = squashCommitMessage;
  }
  return nextcode2.MergeMergeRequest(request);
}
async function updateMergeRequest(nextcode2, mergeRequestId, title, description, targetBranch, mergeMethodInput, removeSourceBranchAfterMergeInput, squashCommitsInput, autoMergeInput, draftInput, repoPathInput) {
  const repoId = await resolveRepoId(nextcode2, repoPathInput);
  const removeSourceBranchAfterMerge = parseBoolean(removeSourceBranchAfterMergeInput);
  const squashCommits = parseBoolean(squashCommitsInput);
  const autoMerge = parseBoolean(autoMergeInput);
  const draft = parseBoolean(draftInput);
  const request = {
    RepoId: repoId,
    Id: requireArg(mergeRequestId, "mergeRequestId")
  };
  if (title) {
    request.Title = title;
  }
  if (description !== void 0) {
    request.Description = description;
  }
  if (targetBranch) {
    request.TargetBranch = targetBranch;
  }
  if (mergeMethodInput) {
    request.MergeMethod = mergeMethodInput;
  }
  if (removeSourceBranchAfterMerge !== void 0) {
    request.RemoveSourceBranchAfterMerge = removeSourceBranchAfterMerge;
  }
  if (squashCommits !== void 0) {
    request.SquashCommits = squashCommits;
  }
  if (autoMerge !== void 0) {
    request.AutoMerge = autoMerge;
  }
  if (draft !== void 0) {
    request.Draft = draft;
  }
  return nextcode2.UpdateMergeRequest(request);
}
async function getMergeRequestMergeability(nextcode2, mergeRequestId, repoPathInput) {
  const repoId = await resolveRepoId(nextcode2, repoPathInput);
  return nextcode2.GetMergeRequestMergeability({
    RepoId: repoId,
    Id: requireArg(mergeRequestId, "mergeRequestId")
  });
}
async function closeMergeRequest(nextcode2, mergeRequestId, repoPathInput) {
  const repoId = await resolveRepoId(nextcode2, repoPathInput);
  const request = {
    RepoId: repoId,
    Id: requireArg(mergeRequestId, "mergeRequestId")
  };
  return nextcode2.CloseMergeRequest(request);
}
function registerMergeRequestCommands(program3, nextcode2, execute2) {
  const mergeRequestProgram = program3.command("merge-request").description("Merge request operations");
  mergeRequestProgram.command("create").description("Create a merge request.").requiredOption("--source-branch <branch>", "Source branch (defaults to current branch)").requiredOption("--target-branch <branch>", "Target branch").requiredOption("--title <title>", "Merge request title").option("--description <description>", "Merge request description").option("--merge-method <method>", "Merge method").option(
    "--remove-source-branch-after-merge <boolean>",
    "Remove source branch after merge"
  ).option("--squash-commits <boolean>", "Squash commits").option("--reviewer-ids <ids>", "Comma-separated reviewer ids").option("--source-repo-path <repoPath>", `Source repo path. ${REPO_PATH_HINT}`).option("--target-repo-path <repoPath>", `Target repo path. ${REPO_PATH_HINT}`).action(function() {
    const options = this.opts();
    return execute2(
      () => createMergeRequest(
        nextcode2,
        options.sourceBranch,
        options.targetBranch,
        options.title,
        options.description,
        options.mergeMethod,
        options.removeSourceBranchAfterMerge,
        options.squashCommits,
        options.reviewerIds,
        options.sourceRepoPath,
        options.targetRepoPath
      )
    );
  });
  mergeRequestProgram.command("get").description("Get merge request details.").requiredOption("--merge-request-id <id>", "Merge request id").option("--with-version <boolean>", "Include version details").option("--repo-path <repoPath>", `Repository path. ${REPO_PATH_HINT}`).action(function() {
    const options = this.opts();
    return execute2(
      () => getMergeRequest(
        nextcode2,
        options.mergeRequestId,
        options.withVersion,
        options.repoPath
      )
    );
  });
  mergeRequestProgram.command("list").description("List merge requests.").option("--status <status>", "Merge request status").option("--page-number <pageNumber>", "Page number").option("--page-size <pageSize>", "Page size").option("--repo-path <repoPath>", `Repository path. ${REPO_PATH_HINT}`).action(function() {
    const options = this.opts();
    return execute2(
      () => listMergeRequests(
        nextcode2,
        options.status,
        options.pageNumber,
        options.pageSize,
        options.repoPath
      )
    );
  });
  mergeRequestProgram.command("merge").description("Merge a merge request.").requiredOption("--merge-request-id <id>", "Merge request id").option("--merge-method <method>", "Merge method").option(
    "--remove-source-branch-after-merge <boolean>",
    "Remove source branch after merge"
  ).option("--squash-commits <boolean>", "Squash commits").option("--merge-commit-message <message>", "Merge commit message").option("--squash-commit-message <message>", "Squash commit message").option("--repo-path <repoPath>", `Repository path. ${REPO_PATH_HINT}`).action(function() {
    const options = this.opts();
    return execute2(
      () => mergeMergeRequest(
        nextcode2,
        options.mergeRequestId,
        options.mergeMethod,
        options.removeSourceBranchAfterMerge,
        options.squashCommits,
        options.mergeCommitMessage,
        options.squashCommitMessage,
        options.repoPath
      )
    );
  });
  mergeRequestProgram.command("update").description("Update a merge request.").requiredOption("--merge-request-id <id>", "Merge request id").option("--title <title>", "New title").option("--description <description>", "New description").option("--target-branch <branch>", "New target branch").option("--merge-method <method>", "Merge method").option(
    "--remove-source-branch-after-merge <boolean>",
    "Remove source branch after merge"
  ).option("--squash-commits <boolean>", "Squash commits").option("--auto-merge <boolean>", "Enable auto merge").option("--draft <boolean>", "Mark as draft").option("--repo-path <repoPath>", `Repository path. ${REPO_PATH_HINT}`).action(function() {
    const options = this.opts();
    return execute2(
      () => updateMergeRequest(
        nextcode2,
        options.mergeRequestId,
        options.title,
        options.description,
        options.targetBranch,
        options.mergeMethod,
        options.removeSourceBranchAfterMerge,
        options.squashCommits,
        options.autoMerge,
        options.draft,
        options.repoPath
      )
    );
  });
  mergeRequestProgram.command("mergeability").description("Get merge request mergeability status.").requiredOption("--merge-request-id <id>", "Merge request id").option("--repo-path <repoPath>", `Repository path. ${REPO_PATH_HINT}`).action(function() {
    const options = this.opts();
    return execute2(
      () => getMergeRequestMergeability(nextcode2, options.mergeRequestId, options.repoPath)
    );
  });
  mergeRequestProgram.command("close").description("Close a merge request.").requiredOption("--merge-request-id <id>", "Merge request id").option("--repo-path <repoPath>", `Repository path. ${REPO_PATH_HINT}`).action(function() {
    const options = this.opts();
    return execute2(
      () => closeMergeRequest(nextcode2, options.mergeRequestId, options.repoPath)
    );
  });
}

// commands/review.ts
async function createReview(nextcode2, mergeRequestId, commitId, statusInput, content, resetApprovalAfterReworkInput, publishDraftCommentsInput, repoPathInput) {
  const repoId = await resolveRepoId(nextcode2, repoPathInput);
  const resetApprovalAfterRework = parseBoolean(resetApprovalAfterReworkInput, false) ?? false;
  const publishDraftComments = parseBoolean(publishDraftCommentsInput);
  const request = {
    RepoId: repoId,
    MergeRequestId: requireArg(mergeRequestId, "mergeRequestId"),
    CommitId: requireArg(commitId, "commitId"),
    Status: requireArg(statusInput, "status"),
    ResetApprovalAfterRework: resetApprovalAfterRework
  };
  if (content) {
    request.Content = content;
  }
  if (publishDraftComments !== void 0) {
    request.PublishDraftComments = publishDraftComments;
  }
  return nextcode2.CreateReview(request);
}
async function updateReviewers(nextcode2, mergeRequestId, addReviewerIdsInput, removeReviewerIdsInput, repoPathInput) {
  const repoId = await resolveRepoId(nextcode2, repoPathInput);
  const addReviewerIds = parseCsv(addReviewerIdsInput);
  const removeReviewerIds = parseCsv(removeReviewerIdsInput);
  const request = {
    RepoId: repoId,
    MergeRequestId: requireArg(mergeRequestId, "mergeRequestId")
  };
  if (addReviewerIds) {
    request.AddReviewerIds = addReviewerIds;
  }
  if (removeReviewerIds) {
    request.RemoveReviewerIds = removeReviewerIds;
  }
  return nextcode2.UpdateReviewers(request);
}
async function getReviewStatus(nextcode2, mergeRequestId, repoPathInput) {
  const repoId = await resolveRepoId(nextcode2, repoPathInput);
  return nextcode2.GetReviewStatus({
    RepoId: repoId,
    MergeRequestId: requireArg(mergeRequestId, "mergeRequestId")
  });
}
function registerReviewCommands(program3, nextcode2, execute2) {
  const reviewProgram = program3.command("review").description("Review operations");
  reviewProgram.command("create").description("Create a review.").requiredOption("--merge-request-id <id>", "Merge request id").requiredOption("--commit-id <id>", "Commit id").requiredOption("--status <status>", "Review status").option("--content <content>", "Review content").option(
    "--reset-approval-after-rework <boolean>",
    "Reset approval after rework"
  ).option("--publish-draft-comments <boolean>", "Publish draft comments").option("--repo-path <repoPath>", `Repository path. ${REPO_PATH_HINT}`).action(function() {
    const options = this.opts();
    return execute2(
      () => createReview(
        nextcode2,
        options.mergeRequestId,
        options.commitId,
        options.status,
        options.content,
        options.resetApprovalAfterRework,
        options.publishDraftComments,
        options.repoPath
      )
    );
  });
  reviewProgram.command("update-reviewers").description("Update review reviewers.").requiredOption("--merge-request-id <id>", "Merge request id").option("--add-reviewer-ids <ids>", "Comma-separated reviewer ids to add").option(
    "--remove-reviewer-ids <ids>",
    "Comma-separated reviewer ids to remove"
  ).option("--repo-path <repoPath>", `Repository path. ${REPO_PATH_HINT}`).action(function() {
    const options = this.opts();
    return execute2(
      () => updateReviewers(
        nextcode2,
        options.mergeRequestId,
        options.addReviewerIds,
        options.removeReviewerIds,
        options.repoPath
      )
    );
  });
  reviewProgram.command("status").description("Get review status.").requiredOption("--merge-request-id <id>", "Merge request id").option("--repo-path <repoPath>", `Repository path. ${REPO_PATH_HINT}`).action(function() {
    const options = this.opts();
    return execute2(
      () => getReviewStatus(nextcode2, options.mergeRequestId, options.repoPath)
    );
  });
}

// commands/user.ts
async function getMe(nextcode2) {
  return nextcode2.GetSelf({});
}
function registerUserCommands(program3, nextcode2, execute2) {
  const userProgram = program3.command("user").description("User operations");
  userProgram.command("me").description("Get current user (login user) information.").action(() => execute2(() => getMe(nextcode2)));
}

// command.ts
var nextcodeOptions = {
  userJwt: process.env.NEXTCODE_TOKEN
};
var nextcode = new NextCode(nextcodeOptions);
var program2 = new Command();
program2.name("gitlab-action").description("GitLab Action CLI \u2014 Repository, MR, Review, Comment, Branch, User and more.").showHelpAfterError().showSuggestionAfterError();
var execute = async (handler) => {
  try {
    const result = await handler();
    printResult(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exit(1);
  }
};
registerRepoCommands(program2, nextcode, execute);
registerBranchCommands(program2, nextcode, execute);
registerMergeRequestCommands(program2, nextcode, execute);
registerDiffCommands(program2, nextcode, execute);
registerReviewCommands(program2, nextcode, execute);
registerCommentCommands(program2, nextcode, execute);
registerCheckRunCommands(program2, nextcode, execute);
registerRunnerLogCommands(program2, execute);
registerUserCommands(program2, nextcode, execute);
async function run() {
  if (process.argv.length <= 2) {
    program2.help({ error: true });
  }
  await program2.parseAsync(process.argv);
}

// index.ts
run().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
