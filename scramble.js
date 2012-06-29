var attempts, board, c, clickmode, current_letter, current_score, div, down, el, end, expand, formatTime, grid, hasPrefix, hasWord, inPath, isAdjacent, letter, makeSquare, ncols, neighbors, nrows, overletter, path, phantom, pointerPress, pointerRelease, position, possibilities, prefixes, r, renderline, row, solve, sum, updateScore, updatepreview, weightWord, weights, wordmap, words, xhr, _fn, _i, _j, _len, _len1,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

grid = "SERS PATG LINE SERS".split(' ');

nrows = grid.length;

ncols = grid[0].length;

grid = (function() {
  var _i, _len, _results;
  _results = [];
  for (_i = 0, _len = grid.length; _i < _len; _i++) {
    row = grid[_i];
    _results.push((function() {
      var _j, _len1, _results1;
      _results1 = [];
      for (_j = 0, _len1 = row.length; _j < _len1; _j++) {
        el = row[_j];
        _results1.push(el === "Q" ? "QU" : el);
      }
      return _results1;
    })());
  }
  return _results;
})();

board = document.getElementById('board');

wordmap = {};

prefixes = {};

words = null;

weights = {
  A: 1,
  B: 4,
  C: 4,
  D: 2,
  E: 1,
  F: 4,
  G: 3,
  H: 3,
  I: 1,
  J: 10,
  K: 5,
  L: 2,
  M: 4,
  N: 2,
  O: 1,
  P: 4,
  QU: 10,
  R: 1,
  S: 1,
  T: 1,
  U: 2,
  V: 5,
  W: 4,
  X: 8,
  Y: 3,
  Z: 10
};

xhr = new XMLHttpRequest();

xhr.open('get', 'dictionary.txt', true);

wordmap = {};

xhr.onload = function() {
  var header, list, path, word;
  words = xhr.responseText.split('\n');
  header = words.splice(0, 1)[0];
  return list = (function() {
    var _i, _len, _ref, _ref1, _results;
    _ref = solve();
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      _ref1 = _ref[_i], word = _ref1[0], path = _ref1[1];
      if (wordmap[word]) {
        wordmap[word].push(path);
      } else {
        wordmap[word] = [path];
      }
      _results.push(word);
    }
    return _results;
  })();
};

xhr.send(null);

down = false;

clickmode = false;

current_letter = null;

current_score = 0;

path = [];

attempts = [];

end = +(new Date) + 3 * 60 * 1000;

phantom = function() {
  var plan, typeWord, wordlist;
  wordlist = Object.keys(wordmap).sort(function(a, b) {
    return weightWord(a) - weightWord(b);
  });
  plan = [];
  typeWord = function() {
    var a, word, x, y, _ref;
    if (plan.length === 0) {
      clickmode = false;
      pointerRelease();
      word = wordlist.pop();
      plan = (function() {
        var _i, _len, _ref, _results;
        _ref = wordmap[word][0];
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          a = _ref[_i];
          _results.push(a);
        }
        return _results;
      })();
      return setTimeout(typeWord, 762);
    } else {
      _ref = plan.shift(), y = _ref[0], x = _ref[1];
      clickmode = true;
      down = true;
      overletter(x, y, document.getElementById('sq-r' + x + 'c' + y));
      down = false;
      return setTimeout(typeWord, 82);
    }
  };
  return typeWord();
};

sum = function(arr) {
  var n, s, _i, _len;
  s = 0;
  for (_i = 0, _len = arr.length; _i < _len; _i++) {
    n = arr[_i];
    s += n;
  }
  return s;
};

weightWord = function(word) {
  var letter;
  return sum((function() {
    var _i, _len, _results;
    _results = [];
    for (_i = 0, _len = word.length; _i < _len; _i++) {
      letter = word[_i];
      _results.push(weights[letter]);
    }
    return _results;
  })());
};

inPath = function(needle, haystack) {
  var i, _i, _len;
  for (_i = 0, _len = haystack.length; _i < _len; _i++) {
    i = haystack[_i];
    if (i[0] === needle[0] && i[1] === needle[1]) {
      return true;
    }
  }
  return false;
};

isAdjacent = function(first, second) {
  return Math.abs(first[0] - second[0]) <= 1 && Math.abs(first[1] - second[1]) <= 1;
};

neighbors = function(_arg) {
  var matches, nx, ny, x, y, _i, _j, _ref, _ref1, _ref2, _ref3;
  x = _arg[0], y = _arg[1];
  matches = [];
  for (nx = _i = _ref = Math.max(0, x - 1), _ref1 = Math.min(x + 2, ncols); _ref <= _ref1 ? _i < _ref1 : _i > _ref1; nx = _ref <= _ref1 ? ++_i : --_i) {
    for (ny = _j = _ref2 = Math.max(0, y - 1), _ref3 = Math.min(y + 2, nrows); _ref2 <= _ref3 ? _j < _ref3 : _j > _ref3; ny = _ref2 <= _ref3 ? ++_j : --_j) {
      matches.push([nx, ny]);
    }
  }
  return matches;
};

hasPrefix = function(prefix) {
  var max, mid, min;
  if (prefix.length === 1) {
    return true;
  }
  min = 0;
  max = words.length - 1;
  while (max - min > 1) {
    mid = Math.floor(min / 2 + max / 2);
    if (words[mid].slice(0, prefix.length) === prefix) {
      return true;
    }
    if (words[mid] < prefix) {
      min = mid;
    } else {
      max = mid;
    }
  }
  return false;
};

hasWord = function(word) {
  var max, mid, min;
  min = 0;
  max = words.length - 1;
  while (max - min > 1) {
    mid = Math.floor(min / 2 + max / 2);
    if (words[mid] === word) {
      return true;
    }
    if (words[mid] < word) {
      min = mid;
    } else {
      max = mid;
    }
  }
  return false;
};

expand = function(prefix, path) {
  var matches, nx, ny, path1, prefix1, result, _i, _j, _len, _len1, _ref, _ref1, _ref2;
  matches = [];
  if (hasWord(prefix)) {
    matches.push([prefix, path]);
  }
  _ref = neighbors(path[path.length - 1]);
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    _ref1 = _ref[_i], nx = _ref1[0], ny = _ref1[1];
    if (!inPath([nx, ny], path)) {
      prefix1 = prefix + grid[ny][nx];
      if (hasPrefix(prefix)) {
        path1 = path.concat([[nx, ny]]);
        _ref2 = expand(prefix1, path1);
        for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
          result = _ref2[_j];
          matches.push(result);
        }
      }
    }
  }
  return matches;
};

solve = function() {
  var c, letter, matches, r, result, _i, _j, _k, _len, _len1, _len2, _ref;
  matches = [];
  for (r = _i = 0, _len = grid.length; _i < _len; r = ++_i) {
    row = grid[r];
    for (c = _j = 0, _len1 = row.length; _j < _len1; c = ++_j) {
      letter = row[c];
      _ref = expand(letter, [[c, r]]);
      for (_k = 0, _len2 = _ref.length; _k < _len2; _k++) {
        result = _ref[_k];
        matches.push(result);
      }
    }
  }
  return matches;
};

formatTime = function(msec) {
  var min, pad, sec;
  if (msec < 0) {
    return "Time's Up!";
  }
  pad = function(num) {
    var _i, _ref;
    for (_i = 0, _ref = 2 - (num + "").length; 0 <= _ref ? _i < _ref : _i > _ref; 0 <= _ref ? _i++ : _i--) {
      num = "0" + num;
    }
    return num;
  };
  sec = Math.floor(msec / 1000);
  min = Math.floor(sec / 60);
  return min + ":" + pad(sec % 60);
};

makeSquare = function(text) {
  var letter, u, weight;
  letter = document.createElement('div');
  letter.className = "square";
  letter.innerHTML = text.slice(0, 1);
  weight = document.createElement('div');
  weight.className = 'weight';
  weight.innerHTML = weights[text];
  letter.appendChild(weight);
  if (text === "QU") {
    u = document.createElement('span');
    u.innerHTML = 'u';
    u.style.fontSize = '20px';
    letter.appendChild(u);
  }
  return letter;
};

position = function(el) {
  var left, top;
  left = 0;
  top = 0;
  while (el.offsetParent) {
    left += el.offsetLeft;
    top += el.offsetTop;
    el = el.offsetParent;
  }
  return [left, top];
};

updateScore = function() {
  var word;
  return document.getElementById('score').innerHTML = current_score + '/' + sum((function() {
    var _i, _len, _ref, _results;
    _ref = Object.keys(wordmap);
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      word = _ref[_i];
      _results.push(weightWord(word));
    }
    return _results;
  })());
};

overletter = function(row, col, el) {
  var c, lc, lr, r, word, _ref;
  if (!clickmode) {
    current_letter = [row, col, el];
  }
  if (down) {
    document.getElementById('word').className = '';
    if (!inPath([row, col], path) && (path.length === 0 || isAdjacent([row, col], path[path.length - 1])) && grid[row][col]) {
      if (path.length !== 0) {
        _ref = path[path.length - 1], lr = _ref[0], lc = _ref[1];
        renderline(el, document.getElementById('sq-r' + lr + 'c' + lc));
      }
      path.push([row, col]);
      word = ((function() {
        var _i, _len, _ref1, _results;
        _results = [];
        for (_i = 0, _len = path.length; _i < _len; _i++) {
          _ref1 = path[_i], r = _ref1[0], c = _ref1[1];
          _results.push(grid[r][c]);
        }
        return _results;
      })()).join('');
      updatepreview(word);
      return el.className = 'square hover';
    }
  }
};

updatepreview = function(word) {
  var score, text;
  document.getElementById('word').innerHTML = '';
  text = document.createElement('div');
  text.className = 'word';
  text.innerHTML = word;
  document.getElementById('word').appendChild(text);
  score = document.createElement('div');
  score.className = 'score';
  score.innerHTML = weightWord(word);
  return document.getElementById('word').appendChild(score);
};

renderline = function(el, other) {
  var col, dx, dy, l, lc, left, line, lr, oldleft, oldtop, t, top, _ref, _ref1, _ref2, _ref3;
  _ref = [el.row, el.col], row = _ref[0], col = _ref[1];
  _ref1 = [other.row, other.col], lr = _ref1[0], lc = _ref1[1];
  line = document.createElement('div');
  _ref2 = position(el), left = _ref2[0], top = _ref2[1];
  _ref3 = [col - lc, row - lr], dx = _ref3[0], dy = _ref3[1];
  oldleft = left - 74 * dx;
  oldtop = top - 74 * dy;
  l = left / 2 + oldleft / 2 + 27;
  t = top / 2 + oldtop / 2 + 27;
  if (dy === 1 && dx === -1 || dy === -1 && dx === 1) {
    line.className = "line ne";
  }
  if (dy === 1 && dx === 0 || dy === -1 && dx === 0) {
    line.className = "line e";
  }
  if (dy === 0 && dx === -1 || dy === 0 && dx === 1) {
    line.className = "line w";
  }
  if (dy === -1 && dx === -1 || dy === 1 && dx === 1) {
    line.className = "line nw";
  }
  line.style.top = t + 'px';
  line.style.left = l + 'px';
  return board.appendChild(line);
};

pointerPress = function() {
  down = true;
  if (!clickmode) {
    document.getElementById('word').innerHTML = '';
  }
  document.getElementById('word').className = '';
  if (current_letter) {
    overletter.apply(this, current_letter);
  }
  return current_letter = null;
};

pointerRelease = function() {
  var line, word, x, y, _i, _j, _len, _len1, _ref, _ref1;
  if (clickmode === true) {
    return;
  }
  down = false;
  _ref = document.querySelectorAll('.square');
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    el = _ref[_i];
    el.className = 'square';
  }
  word = ((function() {
    var _j, _len1, _ref1, _results;
    _results = [];
    for (_j = 0, _len1 = path.length; _j < _len1; _j++) {
      _ref1 = path[_j], x = _ref1[0], y = _ref1[1];
      _results.push(grid[x][y]);
    }
    return _results;
  })()).join('');
  path = [];
  _ref1 = document.querySelectorAll('.line');
  for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
    line = _ref1[_j];
    line.parentNode.removeChild(line);
  }
  if (word.length > 1) {
    if (__indexOf.call(attempts, word) >= 0) {
      document.getElementById('word').className = 'old';
    } else if (hasWord(word)) {
      current_score += weightWord(word);
      updateScore();
      document.getElementById('word').className = 'good';
    } else {
      document.getElementById('word').className = 'bad';
    }
    attempts.push(word);
  }
  return current_letter = null;
};

setInterval(function() {
  var time;
  time = formatTime(end - new Date);
  document.getElementById('timer').innerHTML = time;
  return updateScore();
}, 1000);

document.getElementById('word').addEventListener('click', function(e) {
  if (clickmode) {
    clickmode = false;
    return pointerRelease();
  }
});

document.body.addEventListener("mousedown", function(e) {
  el = document.elementFromPoint(e.clientX, e.clientY);
  if (el && (el.row != null) && (el.col != null)) {
    current_letter = [el.row, el.col, el];
  }
  pointerPress();
  return e.preventDefault();
});

document.getElementById('board').addEventListener("contextmenu", function(e) {
  return e.preventDefault();
});

document.body.addEventListener("touchstart", function(e) {
  pointerPress();
  return e.preventDefault();
});

document.body.addEventListener("touchend", function(e) {
  return pointerRelease();
});

document.body.addEventListener("mouseup", function(e) {
  return pointerRelease();
});

document.body.addEventListener("touchmove", function(e) {
  if (e && e.touches && e.touches[0]) {
    el = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY);
    if (el && (el.row != null) && (el.col != null)) {
      overletter(el.row, el.col, el);
    }
  }
  return e.preventDefault();
});

possibilities = [];

document.body.addEventListener("keypress", function(e) {
  var blah, col, i, j, letter, line, newstuff, possibility, square, tmp, word, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _ref, _ref1, _results;
  if (e.keyCode === 13 || String.fromCharCode(e.keyCode) === " ") {
    console.log("pressed enter");
    if (possibilities.length > 0) {
      path = possibilities[0];
      pointerRelease();
      possibilities = [];
      return;
    }
  }
  letter = String.fromCharCode(e.keyCode).toUpperCase();
  newstuff = [];
  document.getElementById('word').className = '';
  _ref = document.querySelectorAll('.line');
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    line = _ref[_i];
    line.parentNode.removeChild(line);
  }
  _ref1 = document.querySelectorAll('.square');
  for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
    square = _ref1[_j];
    square.className = "square";
  }
  for (i = _k = 0, _len2 = grid.length; _k < _len2; i = ++_k) {
    row = grid[i];
    for (j = _l = 0, _len3 = row.length; _l < _len3; j = ++_l) {
      col = row[j];
      if (col === letter) {
        if (possibilities.length === 0) {
          newstuff.push([[i, j]]);
        } else {
          newstuff = newstuff.concat(possibilities.filter(function(chance) {
            return isAdjacent([i, j], chance[chance.length - 1]) && !inPath([i, j], chance);
          }).map(function(chance) {
            return chance.concat([[i, j]]);
          }));
        }
      }
    }
  }
  if (newstuff.length > 0) {
    possibilities = newstuff;
    word = ((function() {
      var _len4, _m, _ref2, _ref3, _results;
      _ref2 = possibilities[0];
      _results = [];
      for (_m = 0, _len4 = _ref2.length; _m < _len4; _m++) {
        _ref3 = _ref2[_m], i = _ref3[0], j = _ref3[1];
        _results.push(grid[i][j]);
      }
      return _results;
    })()).join('');
    updatepreview(word);
  }
  _results = [];
  for (_m = 0, _len4 = possibilities.length; _m < _len4; _m++) {
    possibility = possibilities[_m];
    blah = null;
    _results.push((function() {
      var _len5, _n, _ref2, _results1;
      _results1 = [];
      for (_n = 0, _len5 = possibility.length; _n < _len5; _n++) {
        _ref2 = possibility[_n], i = _ref2[0], j = _ref2[1];
        tmp = document.getElementById('sq-r' + i + 'c' + j);
        tmp.className = 'square hover';
        if (blah !== null) {
          renderline(blah, tmp);
        }
        _results1.push(blah = tmp);
      }
      return _results1;
    })());
  }
  return _results;
});

for (r = _i = 0, _len = grid.length; _i < _len; r = ++_i) {
  row = grid[r];
  div = document.createElement('div');
  board.appendChild(div);
  _fn = function(r, c, letter) {
    var square;
    square = makeSquare(letter);
    square.row = r;
    square.col = c;
    square.id = 'sq-r' + r + 'c' + c;
    square.addEventListener("mouseover", function(e) {
      overletter(r, c, square);
      return e.preventDefault();
    });
    square.addEventListener("mousedown", function(e) {
      overletter(r, c, square);
      return e.preventDefault();
    });
    square.addEventListener("click", function(e) {
      if (down === false || clickmode === true) {
        clickmode = true;
        down = true;
        overletter(r, c, square);
        down = false;
      }
      return e.preventDefault();
    });
    return div.appendChild(square);
  };
  for (c = _j = 0, _len1 = row.length; _j < _len1; c = ++_j) {
    letter = row[c];
    _fn(r, c, letter);
  }
}
