[
 (blockComment)
 (LineComment)
] @comment

(TypeIdentifier) @type
(TypeBuiltin) @type.builtin
(Identifier) @variable

(SpecialFunctionDeclaration) @function.builtin

(StringLiteral) @string
(Address) @number
(IntegerLiteral) @number
;(TypeAnnotation) @type

(Parameter Identifier: (Identifier) @variable.parameter)
[
    "var"
    "let"
] @type.qualifier

(Access) @keyword
(transactionDeclaration) @keyword

[
    "contract"
    "event"
    "struct"
    "resource"
    "interface"
    "enum"
    "fun"
    "pre"
    "post"
    "execute"
    "self"
    "return"
    "import"
    "from"
] @keyword

[
    "("
    ")"
    "}"
    "{"
] @punctuation.bracket

"." @punctuation.delimiter
