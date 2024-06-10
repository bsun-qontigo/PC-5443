try {
    require('colors');
    const { isAbsolute } = require('path');
    Object.defineProperty(String.prototype, 'prettyPath', {
        get: function() {
            return removePresedingSlashes(this).cyan;
        }
    });

    Object.defineProperty(String.prototype, 'nl', {
        get: function() {
            return `${this}
`;
        }
    })

    const { error, warn } = console;
    console.warn = function(...args) {
        return warn.apply(console, ['WARN:'.bgYellow.black].concat(args));
    }

    console.error = function(...args) {
        return error.apply(console, ['ERROR:'.bgRed.white].concat(args));
    }

    const removePresedingSlashes = function (path) {
        path = path.replace(/\\/g, '/');
        while (path[0] === '/') {
            path = path.slice(1);
        }
        return isAbsolute(path) ? path : './' + path;
    }
} catch {}
