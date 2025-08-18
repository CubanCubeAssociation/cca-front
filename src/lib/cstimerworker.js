let cstimerWorker = (function () {
  var worker = new Worker("cstimer_module.js");

  var callbacks = {};
  var msgid = 0;

  worker.onmessage = function (e) {
    var data = e.data; //data: [msgid, type, ret]
    var callback = callbacks[data[0]];
    delete callbacks[data[0]];
    if (callback) callback(data[2]);
  };

  function callWorkerAsync(type, details) {
    return new Promise(
      function (type, details, resolve) {
        ++msgid;
        callbacks[msgid] = resolve;
        worker.postMessage([msgid, type, details]);
      }.bind(null, type, details)
    );
  }

  return {
    getScrambleTypes: function () {
      return callWorkerAsync("scrtype");
    },
    getScramble: function () {
      return callWorkerAsync("scramble", Array.prototype.slice.apply(arguments));
    },
    setSeed: function (seed) {
      return callWorkerAsync("seed", [seed]);
    },
    setGlobal: function (key, value) {
      return callWorkerAsync("set", [key, value]);
    },
    getImage: function (scramble, type) {
      return callWorkerAsync("image", [scramble, type]);
    },
  };
})();

console.log("Generate scramble for 3x3x3");

var scrStr = "";
var queue = cstimerWorker
  .getScramble("333")
  .then(function (_scrStr) {
    scrStr = _scrStr;
    console.log("Scramble generated: ", scrStr);
    return cstimerWorker.getImage(scrStr, "333");
  })
  .then(function (svgImage) {
    console.log("Scramble image[0, 100): ", svgImage.slice(0, 100));
  });

var wca_events = [
  ["3x3x3", "333", 0],
  ["2x2x2", "222so", 0],
  ["4x4x4", "444wca", 0],
  ["5x5x5", "555wca", 60],
  ["6x6x6", "666wca", 80],
  ["7x7x7", "777wca", 100],
  ["3x3 bld", "333ni", 0],
  ["3x3 fm", "333fm", 0],
  ["3x3 oh", "333", 0],
  ["clock", "clkwca", 0],
  ["megaminx", "mgmp", 70],
  ["pyraminx", "pyrso", 10],
  ["skewb", "skbso", 0],
  ["sq1", "sqrs", 0],
  ["4x4 bld", "444bld", 40],
  ["5x5 bld", "555bld", 60],
  ["3x3 mbld", "r3ni", 5],
];

for (var i = 0; i < wca_events.length; i++) {
  var param = wca_events[i];
  queue = queue
    .then(
      function (type, length) {
        console.log("Generate scramble for " + type);
        return cstimerWorker.getScramble(type, length);
      }.bind(null, param[1], param[2])
    )
    .then(
      function (type, scrStr) {
        console.log("Generated: ", scrStr);
        return cstimerWorker.getImage(scrStr, type);
      }.bind(null, param[1])
    )
    .then(function (imageSvg) {
      console.log("Scramble image[0, 100): ", imageSvg && imageSvg.slice(0, 100));
    });
}
