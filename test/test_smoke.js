#!/opt/bin/mocha --ui=tdd

'use strict';
let assert = require('assert')
let fs = require('fs')
let dp = require('..')

suite('Outline', function() {
    test('empty input', function() {
	assert.equal(dp.pdfmark_bookmarks(''), '')
	assert.equal(dp.pdfmark_bookmarks("\n\n\n"), '')
	assert.equal(dp.pdfmark_bookmarks('(bookmarks)'), '')
    })

    test('1', function() {
	assert.equal(dp.pdfmark_bookmarks('(b (1 2))'), // invalid page spec
		     "[/Page 1 /Title (1) /OUT pdfmark\n")
	assert.equal(dp.pdfmark_bookmarks('(b (1 "#2"))'),
		     "[/Page 2 /Title (1) /OUT pdfmark\n")
	assert.equal(dp.pdfmark_bookmarks('(b ("q,w,(e)" "#2"))'),
		     "[/Page 2 /Title (q\\,w\\,\\(e\\)) /OUT pdfmark\n")
    })

    test('multi', function() {
	assert.equal(dp.pdfmark_bookmarks(fs.readFileSync(__dirname + '/' + 'multi.lisp').toString()), `[/Page 1 /Title (Preface) /OUT pdfmark
[/Count 3 /Page 2 /Title (1 Introduction) /OUT pdfmark
[/Page 3 /Title (1.1 F\\(o\\)o) /OUT pdfmark
[/Count 1 /Page 4 /Title (1.2 B\\,ar) /OUT pdfmark
[/Page 5 /Title (1.2.1 bbb) /OUT pdfmark
[/Page 6 /Title (1.3 Baz) /OUT pdfmark
[/Page 7 /Title (2 Setup) /OUT pdfmark
`)
    })
})

suite('Meta', function() {
    test('empty input', function() {
	assert.equal(dp.pdfmark_meta(''), '')
	assert.equal(dp.pdfmark_meta("\n\n\n"), '')
    })

    test('broken', function() {
	assert.throws( () => dp.pdfmark_meta("a"), /incomplete input/)
	assert.throws( () => dp.pdfmark_meta("a b"), /incomplete input/)
	assert.throws( () => dp.pdfmark_meta("a a\tc"), /invalid tag name/)
	assert.throws( () => dp.pdfmark_meta("a\t"), /empty tag value/)
	assert.throws( () => dp.pdfmark_meta(`a\t""`), /empty tag value/)
	assert.throws( () => dp.pdfmark_meta(`a\t" "`), /empty tag value/)
    })

    test('simple', function() {
	assert.equal(dp.pdfmark_meta(fs.readFileSync(__dirname + '/' + 'meta.txt').toString()), `[ /Author (John Doe\\, Jane Doe)
  /CreationDate (D:19980101000000)
  /Creator (Heaven knows)
  /Producer (A \\(custom makefile!)
  /Title (Foo Bar)
  /Subject (An Administrator Guide to Foobar)
  /Keywords (one\\, two)
  /ModDate (D:20180101000000)
  /DOCINFO pdfmark
`)
    })
})
