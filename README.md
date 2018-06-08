# djvused2pdfmark

    npm i -g djvused2pdfmark

When converting a djvu file to a pdf, it's often desirable to transfer
the outline & metadata to the pdf as well.

PDF supports a special `pdfmark` operator that is used for features
like bookmarks & docinfo. Using ghostscript, you can augment an
existing pdf w/ pdfmark commands:

    $ gs -sDEVICE=pdfwrite -dNOPAUSE -dQUIET -dBATCH -sOutputFile=out.pdf input.pdf example.pdfmark

djvused2pdfmark helps you to create such `example.pdfmark` file.

## outline

djvused(1) util exports/imports outlines in the form of sexps:

~~~
(bookmarks
 ("Preface" "#1")
 ("1 Introduction" "#2"
  ("1.1 Foo" "#3")
  ("1.2 Bar" "#4"
   ("1.2.1 start" "#5"))
  ("1.3 Baz" "#6"))
 ("2 Setup" "#7")
 )
~~~

To convert them in pdfmark commands, run:

~~~
$ djvused -e print-outline file.djvu | djvused2pdfmark
[/Page 1 /Title (Preface) /OUT pdfmark
[/Count 3 /Page 2 /Title (1 Introduction) /OUT pdfmark
[/Page 3 /Title (1.1 Foo) /OUT pdfmark
[/Count 1 /Page 4 /Title (1.2 Bar) /OUT pdfmark
[/Page 5 /Title (1.2.1 start) /OUT pdfmark
[/Page 6 /Title (1.3 Baz) /OUT pdfmark
[/Page 7 /Title (2 Setup) /OUT pdfmark
~~~

Only outlines that point to page numbers are supported for now.

## meta

For some reason djvused(1) doesn't use sexps for metadata parts, but a
bizarre list of pairs:

~~~
key1\t"value1"
key2\t"value2"
...
~~~

To convert them to pdf docinfo, pass 'meta' CL argument to
djvused2pdfmark cmd:

~~~
$ djvused -e print-outline file.djvu | djvused2pdfmark meta
[ /Author (John Doe\, Jane Doe)
  /CreationDate (D:19980101000000)
  /Creator (Heaven knows)
  /Producer (A \(custom makefile!)
  /Title (Foo Bar)
  /Subject (An Administrator Guide to Foobar)
  /Keywords (one\, two)
  /ModDate (D:20180101000000)
  /DOCINFO pdfmark
~~~

## License

MIT.
