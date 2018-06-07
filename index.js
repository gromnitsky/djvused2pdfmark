#!/usr/bin/env node

'use strict';
let sexp_parse = require('s-expression')
let concat = require('concat-stream')

if (require.main === module) {
    process.stdin.pipe(concat( buf => {
	process.stdout.write(pdfmark_bookmarks(buf.toString()))
    }))
}

function pdfmark_bookmarks(str) {
    let sexp = sexp_parse(str)
    if (sexp instanceof Error) {
	sexp.message = `${sexp.line}:${sexp.col} ${sexp.message}`
	throw sexp
    }
    return walk_and_talk()(sexp.slice(1))
}

module.exports = pdfmark_bookmarks

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
