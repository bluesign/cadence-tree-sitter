[
 (blockComment)
 (LineComment)
] @comment @spell

(CompositeDeclaration) @type
(ImportDeclaration) @include
(Identifier) @variable
(AddressLocation) @variable

(StringLiteral) @string
(TypeAnnotation) @type

(Parameter Identifier: (Identifier) @parameter)
[
    "var"
    "let"
] @type.qualifier

(Access) @keyword

[
  "contract"
  "event"
  "struct"
  "resource"
  "interface"
  "enum"
] @keyword

; (InvocationExpression Identifier: (IdentifierExpression) @function.call) ; foo()
; (InvocationExpression Identifier: (MemberExpression) @function.call) ; foo()


(IntegerLiteral) @number
