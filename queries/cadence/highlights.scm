

(TypeIdentifier) @type
(TypeBuiltin) @type.builtin
(Identifier) @variable
((Identifier) @variable.builtin
  (#eq? @variable.builtin "self"))

(InitDeclaration) @constructor
(SpecialFunctionDeclaration) @function.builtin
(FunctionDeclaration name: (Identifier) @function)

(StringLiteral) @string
(PathExpression) @string
(PathExpression (Identifier) @string)
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
(Access (Entitlements) @label)


(CompositeDeclaration) @keyword

[
    "event"
    "interface"
    "enum"
    "fun"
    "pre"
    "post"
    "execute"
    "return"
    "import"
    "from"
    "view"
    ;"create"
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
