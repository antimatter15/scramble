#grid = "fxieeta amloetb ewbxetc astuetd mopoete slashdf hackerg".toUpperCase().split(' ')
#grid = "abcdefga hijklmnb oparstuc vwxyzabd cdefghie jklmnopf arstuvwg hijklmno".toUpperCase().split(' ')
#grid = "ETHYLE MAIDEN INETET TECAAR ATESAB CQEFGH".split(' ')

#grid = [["L","QU","R","E"],["S","L","U","S"],["A","T","I","C"],["N","R","E","N"]]
grid = "SERS PATG LINE SERS".split(' ')
#grid = 'GREP TNAL ESIT DRES'.split(' ')

#grid = "STNG EIAE DRLS SEPO".split(' ')
#grid = ""

grid = (((if el is "Q" then "QU" else el) for el in row) for row in grid)

nrows = grid.length
ncols = grid[0].length

board = document.getElementById('board')

wordmap = {}
prefixes = {}
words = null
xhr = new XMLHttpRequest()
xhr.open 'get', 'dictionary.txt', true


weights = {
	A: 1, B: 4, C: 4, D: 2, E: 1, F: 4, G: 3,
	H: 3, I: 1, J: 10, K: 5, L: 2, M: 4, N: 2,
	O: 1, P: 4, QU: 10, R: 1, S: 1, T: 1, U: 2,
	V: 5, W: 4, X: 8, Y: 3, Z: 10
}

xhr.onload = ->
	#console.time("Wordmap Buliding")
	words = xhr.responseText.split '\n'
	header = words.splice(0,1)[0]
	#console.timeEnd("Wordmap Buliding")
	console.time("blah")
	wordmap = {}
	list = (for [word, path] in solve()
		#console.log word, path
		if wordmap[word]
			wordmap[word].push path
		else
			wordmap[word] = [path]
		word
	)
	console.timeEnd("blah")
	# for n in [0..20]
	# 	console.log n, (Object.keys(wordmap).filter (e) -> e.length == n).length, (list.filter (e) -> e.length == n).length
	console.log list.length, Object.keys(wordmap)
	# document.getElementById('works').innerHTML = list.sort((b, a) -> weightWord(a) - weightWord(b)).join('\n')
	

xhr.send null

down = false
current_letter = null
current_score = 0
path = []
attempts = []

end = +new Date + 3 * 60 * 1000 

setInterval(->
	time = formatTime(end - new Date)
	document.getElementById('timer').innerHTML = time
	document.getElementById('score').innerHTML = current_score
,1000)

formatTime = (msec) ->
	sec = Math.floor(msec/1000)
	min = Math.floor(sec/60)
	return min + ":" + (sec % 60)

document.body.addEventListener "mousedown", (e) ->
	pointerPress()
	e.preventDefault()

document.body.addEventListener "mousedown", (e) ->
	e.preventDefault()


document.body.addEventListener "touchstart", (e) ->
	pointerPress()
	e.preventDefault()


pointerPress = ->
	down = true
	document.getElementById('word').innerHTML = ''
	document.getElementById('word').className = ''
	overletter.apply(this, current_letter) if current_letter
	current_letter = null

document.body.addEventListener "touchend", (e) ->
	pointerRelease()

document.body.addEventListener "mouseup", (e) ->
	pointerRelease()

document.body.addEventListener "touchmove", (e) ->
	if e and e.touches and e.touches[0]
		el = document.elementFromPoint(e.touches[0].clientX,e.touches[0].clientY)

		overletter(el.row, el.col, el) if el and el.row? and el.col?
	e.preventDefault()
	

weightWord = (word) ->
	sum = 0
	for letter in word
		sum += weights[letter]
	return sum

pointerRelease = ->	
	down = false
	for el in document.querySelectorAll('.square')
		el.className = 'square'
	word = (grid[x][y] for [x,y] in path).join('')
	path = []
	
	if word in attempts
		document.getElementById('word').className = 'old'
	else if hasWord word
		current_score += weightWord word
		document.getElementById('score').innerHTML = current_score
		document.getElementById('word').className = 'good'
	else
		document.getElementById('word').className = 'bad'
	attempts.push word
	current_letter = null



makeSquare = (text) ->
	letter = document.createElement('div')
	letter.className = "square"
	letter.innerHTML = text.slice(0, 1)

	weight = document.createElement('div')
	weight.className = 'weight'
	weight.innerHTML = weights[text]
	letter.appendChild weight
	if text == "QU"
		u = document.createElement('span')
		u.innerHTML = 'u'
		u.style.fontSize = '20px'
		letter.appendChild u

	return letter

overletter = (row, col, el) ->
	current_letter = [row, col, el]
	if down
		if !inPath([row, col], path) and (path.length == 0 or isAdjacent([row, col], path[path.length - 1])) and grid[row][col]
			path.push [row, col]
			document.getElementById('word').innerHTML = ''
			text = document.createElement('div')
			text.className = 'word'
			word = (grid[r][c] for [r, c] in path).join('')
			text.innerHTML = word
			document.getElementById('word').appendChild text
			score = document.createElement('div')
			score.className = 'score'
			score.innerHTML = weightWord(word)
			document.getElementById('word').appendChild score
			el.className = 'square hover'

inPath = (needle, haystack) ->
	for i in haystack
		return true if i[0] == needle[0] and i[1] == needle[1]
	return false

isAdjacent = (first, second) ->
	return Math.abs(first[0] - second[0]) <= 1 and Math.abs(first[1] - second[1]) <= 1

for row, r in grid
	div = document.createElement('div')
	board.appendChild(div)
	for letter, c in row
		do (r, c, letter) ->
			square = makeSquare(letter)
			square.row = r
			square.col = c
			square.addEventListener "mouseover", (e) ->
				overletter(r, c, square)
				e.preventDefault()
			square.addEventListener "mousedown", (e) ->
				overletter(r, c, square)
				e.preventDefault()
			
			div.appendChild square

neighbors = ([x, y]) ->
	matches = []
	for nx in [Math.max(0, x - 1)...Math.min(x + 2, ncols)]
		for ny in [Math.max(0, y - 1)...Math.min(y + 2, nrows)]
			matches.push [nx, ny]
	return matches


hasPrefix = (prefix) ->
	if prefix.length == 1
		return true
	min = 0
	max = words.length - 1
	while max - min > 1
		mid = Math.floor(min/2 + max/2)
		if words[mid].slice(0, prefix.length) == prefix
			return true
		if words[mid] < prefix then min = mid else max = mid
	return false

hasWord = (word) ->
	min = 0
	max = words.length - 1
	while max - min > 1
		mid = Math.floor(min/2 + max/2)
		return true if words[mid] == word
		if words[mid] < word then min = mid else max = mid
	return false

expand = (prefix, path) ->
	matches = []

	if hasWord prefix
		matches.push [prefix, path]
	for [nx, ny] in neighbors(path[path.length - 1])
		# console.log nx, ny, path
		unless inPath [nx, ny], path
			prefix1 = prefix + grid[ny][nx]
			if hasPrefix prefix
				path1 = path.concat([[nx, ny]])
				#console.log path1, prefix1
				matches.push result for result in expand(prefix1, path1)
	return matches

solve = ->
	matches = []
	for row, r in grid
		for letter, c in row
			for result in expand(letter, [[c, r]])
				matches.push result
	matches

