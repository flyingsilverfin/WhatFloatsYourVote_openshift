export var smooth_scroll_to = function(element, target, duration) {
    target = Math.round(target);
    duration = Math.round(duration);
    if (duration < 0) {
        return Promise.reject("bad duration");
    }
    if (duration === 0) {
        element.scrollTop = target;
        return Promise.resolve();
    }

    var start_time = Date.now();
    var end_time = start_time + duration;

    var start_top = element.scrollTop;
    var distance = target - start_top;

    // based on http://en.wikipedia.org/wiki/Smoothstep
    var smooth_step = function(start, end, point) {
        if(point <= start) { return 0; }
        if(point >= end) { return 1; }
        var x = (point - start) / (end - start); // interpolation
        return x*x*(3 - 2*x);
    }

    return new Promise(function(resolve, reject) {
        // This is to keep track of where the element's scrollTop is
        // supposed to be, based on what we're doing
        var previous_top = element.scrollTop;

        // This is like a think function from a game loop
        var scroll_frame = function() {
            if(element.scrollTop != previous_top) {
                reject("interrupted");
                return;
            }

            // set the scrollTop for this frame
            var now = Date.now();
            var point = smooth_step(start_time, end_time, now);
            var frameTop = Math.round(start_top + (distance * point));
            element.scrollTop = frameTop;

            // check if we're done!
            if(now >= end_time) {
                resolve();
                return;
            }

            // If we were supposed to scroll but didn't, then we
            // probably hit the limit, so consider it done; not
            // interrupted.
            if(element.scrollTop === previous_top
                && element.scrollTop !== frameTop) {
                resolve();
                return;
            }
            previous_top = element.scrollTop;

            // schedule next frame for execution
            setTimeout(scroll_frame, 0);
        }

        // boostrap the animation process
        setTimeout(scroll_frame, 0);
    });
}


export function getCoords(elem) { // crossbrowser version
    var box = elem.getBoundingClientRect();

    var body = document.body;
    var docEl = document.documentElement;

    var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
    var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

    var clientTop = docEl.clientTop || body.clientTop || 0;
    var clientLeft = docEl.clientLeft || body.clientLeft || 0;

    var top  = box.top +  scrollTop - clientTop;
    var left = box.left + scrollLeft - clientLeft;

    return { top: Math.round(top), left: Math.round(left) };
}

export function capitalizeWord(str) {
    return str.substr(0,1).toUpperCase() + str.substr(1);
}

export function httpGet(url, callback) {
    let req = new XMLHttpRequest();
    req.overrideMimeType("application/json");
    req.open('GET', url, true);
    req.onreadystatechange = function() {
        if (req.readyState === 4 && req.status === 200) {
            callback(req.responseText);
        }
    };
    req.send(null);
}

export function httpPost(url, data, callback) {
    let req = new XMLHttpRequest();   // new HttpRequest instance 
    req.open("POST", url);
    req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    req.send(JSON.stringify(data));
    req.onloadend = callback;   //TODO test this works
}

export function strContains(s, substr) {
    return s.indexOf(substr) !== -1;
}

export function isArray(arr) {
    if (Array.isArray) {
        return Array.isArray(arr);
    } else {
        return Object.prototype.toString.call(obj) === '[object Array]';
    }
}

export function type_of(data) {
    if (isArray(data)) {
        return 'array';
    }
    return typeof data;
}

export function is_primitive(value) {
    let type = type_of(value);
    return is_primitive_type(type);
}

export function is_primitive_type(type) {
    return (type === 'number' || type === 'string' || type === 'boolean');      
}

export function is_simple_builtin_type(type) {
    return (type === 'object'   || 
            type === 'array'    || 
            type === 'number'   ||
            type === 'string'   ||
            type === 'boolean');
}


// https://stackoverflow.com/questions/15313418/what-is-assert-in-javascript
export function assert(condition, message) {
    if (!condition) {
        message = message || "Assertion failed";
        if (typeof Error !== "undefined") {
            throw new Error(message);
        }
        throw message; // Fallback
    }
}
