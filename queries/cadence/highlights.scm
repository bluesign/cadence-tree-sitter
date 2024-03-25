

(TypeIdentifier) @type
(TypeBuiltin) @type.builtin
(Identifier) @variable

(InitDeclaration) @constructor
(SpecialFunctionDeclaration) @function.builtin
(FunctionDeclaration name: (Identifier) @function)

(StringLiteral) @string
(Address) @number
(IntegerLiteral) @number
(BooleanLiteral) @boolean

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
    "view"
] @keyword

[
    "("
    ")"
    "}"
    "{"
    "["
    "]"
] @punctuation.bracket

"." @punctuation.delimiter

(Comment) @comment
(DocComment) @comment.doc
