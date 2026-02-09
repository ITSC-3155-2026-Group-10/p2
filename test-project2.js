'use strict';
/* global MakeMultiFilter, TemplateProcessor */
/* eslint-env browser, node */

(function () {
  var root = (typeof window !== 'undefined') ? window : global;

  function sameArray(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
      return false;
    }
    for (var i = 0; i < a.length; i += 1) {
      if (a[i] !== b[i]) {
        return false;
      }
    }
    return true;
  }

  function runProject2Tests() {
    var msg1 = 'SUCCESS';
    var msg2 = 'SUCCESS';
    var msg3 = 'SUCCESS';

    var locals = ['locals', 'msg1', 'msg2', 'msg3'];

    if (typeof MakeMultiFilter !== 'function') {
      console.error('MakeMultiFilter is not a function:', typeof MakeMultiFilter);
      msg1 = 'FAILURE';
    } else {
      var baseA = [1, 2, 3];
      var fA = root.MakeMultiFilter(baseA);

      var baseB = [1, 2, 3, 4];
      var fB = root.MakeMultiFilter(baseB);

      if (typeof fA !== 'function') {
        console.error('MakeMultiFilter did not return a function:', fA);
        msg1 = 'FAILURE';
      } else {
        var res = fA();
        if (!sameArray([1, 2, 3], res)) {
          console.error('Calling filterer with no args should return original array:', res);
          msg1 = 'FAILURE';
        }

        var didCallback = false;
        res = fA(function (x) { return x !== 2; }, function (arr) {
          didCallback = true;

          if (!sameArray([1, 3], arr)) {
            console.error('Filtering out 2 failed:', arr);
            msg1 = 'FAILURE';
          }
          if (!sameArray([1, 2, 3], this)) {
            console.error('Callback "this" is not original array:', this);
            msg1 = 'FAILURE';
          }
        });

        if (!didCallback) {
          console.error('Callback was not called');
          msg1 = 'FAILURE';
        }
        if (res !== fA) {
          console.error('Filterer should return itself for chaining:', res);
          msg1 = 'FAILURE';
        }

        res = fA(function (x) { return x !== 3; });
        if (res !== fA) {
          console.error('Filterer should return itself for chaining (2):', res);
          msg1 = 'FAILURE';
        }

        res = fA();
        if (!sameArray([1], res)) {
          console.error('Final currentArray should be [1]:', res);
          msg1 = 'FAILURE';
        }

        fB(function (x) { return x !== 1; }, function (arr) {
          if (!sameArray([2, 3, 4], arr)) {
            console.error('Second filterer looks like it shares state (global var issue):', arr);
            msg1 = 'FAILURE';
          }
          if (!sameArray([1, 2, 3, 4], this)) {
            console.error('Callback "this" for second filterer is not original array:', this);
            msg1 = 'FAILURE';
          }
        });

        locals.push('baseA', 'fA', 'baseB', 'fB', 'res', 'didCallback');
      }
    }
    console.log('Test MakeMultiFilter:', msg1);

    if (typeof TemplateProcessor !== 'function') {
      console.error('TemplateProcessor is not a function:', typeof TemplateProcessor);
      msg2 = 'FAILURE';
    } else {
      var tpl = 'My favorite month is {{month}} but not the day {{day}} or the year {{year}}';
      var proc = new TemplateProcessor(tpl);
      var dict = { month: 'July', day: '1', year: '2016' };
      var out = proc.fillIn(dict);

      if (out !== 'My favorite month is July but not the day 1 or the year 2016') {
        console.error('TemplateProcessor fillIn produced unexpected output:', out);
        msg2 = 'FAILURE';
      }

      locals.push('tpl', 'proc', 'dict', 'out');
    }
    console.log('Test TemplateProcessor:', msg2);

    locals.forEach(function (name) {
      if (root[name] !== undefined) {
        console.error('Found leaked global symbol:', name);
        msg3 = 'FAILURE';
      }
    });
    console.log('Test Problem 3:', msg3);

    root.Project2Results = {
      p1Message: msg1,
      p2Message: msg2,
      p3Message: msg3,
    };

    if (typeof root.document !== 'undefined') {
      root.onload = function () {
        root.document.getElementById('p1').innerHTML = msg1;
        root.document.getElementById('p2').innerHTML = msg2;
        root.document.getElementById('p3').innerHTML = msg3;
      };
    }
  }

  runProject2Tests();
}());
