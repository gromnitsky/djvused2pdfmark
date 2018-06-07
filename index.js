#!/usr/bin/env node

'use strict';
let {Transform} = require('stream')
let sexp_parse = require('s-expression')

class DjvusedToPdfmark extends Transform {
    constructor(mode = 'bookmarks') {
	super();
	this.chunks = []
	this.converter = exports[`pdfmark_${mode}`]
    }
    _transform(chk, _enc, done) { this.chunks.push(chk); done() }
    _flush() { this.push(this.converter(this.chunks.join``)) }
}
exports.DjvusedToPdfmark = DjvusedToPdfmark

exports.pdfmark_bookmarks = function(str) {
    let sexp = sexp_parse(str)
    if (sexp instanceof Error) {
	sexp.message = `${sexp.line}:${sexp.col} ${sexp.message}`
	throw sexp
    }
    return walk_and_talk()(sexp.slice(1))
}

exports.pdfmark_meta = function(str) {
    let date = s => {
	let d = new Date(s) || new Date()
	let pad = s => ('0'+s).slice(-2)
	return `D:${d.getUTCFullYear()}${pad(d.getUTCMonth()+1)}` +
	    ['getUTCDate', 'getUTCHours', 'getUTCMinutes', 'getUTCSeconds'].
	    map( v => pad(d[v]())).join('')
    }
    let tag = (name, val) => {
	val = val.trim().slice(1, -1)
	return /^(Creation|Mod)Date$/.test(name) ? date(val) : escape(val)
    }

    let tags = str.split("\n").filter(v => v.trim().length).map( (line,idx) => {
	let cols = line.split(/\t/)
	if (cols.length < 2) throw new Error(`incomplete input: ${line}`)
	let [name, val] = [cols[0], cols.slice(1).join(' ')]
	if (!/^[a-zA-Z0-9_-]+$/.test(name))
	    throw new Error(`${idx+1}: invalid tag name: ${name}`)

	return `/${name} (${tag(name, val)})`
    })
    return tags.length ? '[ ' + tags.join`\n  ` + "\n  /DOCINFO pdfmark\n" : ""
}

if (require.main === module) {
    process.stdin.pipe(new DjvusedToPdfmark(process.argv[2])).pipe(process.stdout)
}

// http://ask.xmodulo.com/add-bookmarks-pdf-document-linux.html
function walk_and_talk() {
    let pdfmarks = []
    let page = (v) => Number(String(v).slice(1)) || 1
    let title = (v) => escape(v)
    let bmk = (v) => `/Page ${page(v[1])} /Title (${title(v[0])}) /OUT pdfmark`

    return function walk(sexp) {
	for (let val of sexp) {
	    if (val.length < 2) throw new Error(`incomplete input: ${val}`)
	    if (val.length === 2) {
		pdfmarks.push('[' + bmk(val))
	    } else {
		pdfmarks.push(`[/Count ${val.length-2} ${bmk(val)}`)
		walk(val.slice(2)) // recursion!
	    }
	}
	return pdfmarks.join`\n` + (pdfmarks.length ? "\n" : "")
    }
}

function escape(s) { return String(s).replace(/[(),\\]/g, '\\$&') }
