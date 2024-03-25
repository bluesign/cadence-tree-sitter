[
 (blockComment)
 (LineComment)
] @comment

(TypeIdentifier) @type
(TypeBuiltin) @type.builtin
(Identifier) @variable

(ConstructorDeclaration) @constructor
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
] @keyword

[
    "("
    ")"
    "}"
    "{"
] @punctuation.bracket

"." @punctuation.delimiter
