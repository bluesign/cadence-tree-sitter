function commaSep1(rule) {
  return seq(rule, repeat(seq(",", rule)));
}

function commaSep(rule) {
  return optional(commaSep1(rule));
}

const P = {
  precedenceUnknown: 0,
  // precedenceTernary is the precedence of
  // - ConditionalExpression. right associative!
  precedenceTernary: 1,
  // precedenceLogicalOr is the precedence of
  // - BinaryExpression, with OperationOr
  precedenceLogicalOr: 2,
  // precedenceLogicalAnd is the precedence of
  // - BinaryExpression, with OperationAnd
  precedenceLogicalAnd: 3,
  // precedenceComparison is the precedence of
  // - BinaryExpression, with OperationEqual, OperationNotEqual,
  precedenceComparisonEqual: 4, //TODO:check
  //   OperationLessEqual, OperationLess,
  //   OperationGreater, or OperationGreaterEqual
  precedenceComparison: 5,
  // precedenceNilCoalescing is the precedence of
  // - BinaryExpression, with OperationNilCoalesce. right associative!
  precedenceNilCoalescing: 6,
  // precedenceBitwiseOr is the precedence of
  // - BinaryExpression, with OperationBitwiseOr
  precedenceBitwiseOr: 7,
  // precedenceBitwiseXor is the precedence of
  // - BinaryExpression, with OperationBitwiseXor
  precedenceBitwiseXor: 8,
  // precedenceBitwiseAnd is the precedence of
  // - BinaryExpression, with OperationBitwiseAnd
  precedenceBitwiseAnd: 9,
  // precedenceBitwiseShift is the precedence of
  // - BinaryExpression, with OperationBitwiseLeftShift or OperationBitwiseRightShift
  precedenceBitwiseShift: 10,
  // precedenceAddition is the precedence of
  // - BinaryExpression, with OperationPlus or OperationMinus
  precedenceAddition: 11,
  // precedenceMultiplication is the precedence of
  // - BinaryExpression, with OperationMul, OperationMod, or OperationDiv
  precedenceMultiplication: 12,
  // precedenceCasting is the precedence of
  // - CastingExpression
  precedenceCasting: 13,
  // precedenceUnaryPrefix is the precedence of
  // - UnaryExpression
  // - CreateExpression
  // - DestroyExpression
  // - ReferenceExpression
  precedenceUnaryPrefix: 14,
  // precedenceUnaryPostfix is the precedence of
  // - ForceExpression
  precedenceUnaryPostfix: 15,
  // precedenceAccess is the precedence of
  // - InvocationExpression
  // - IndexExpression
  // - MemberExpression
  precedenceAccess: 16,
  // precedenceLiteral is the precedence of
  // - BoolExpression
  // - NilExpression
  // - StringExpression
  // - IntegerExpression
  // - FixedPointExpression
  // - ArrayExpression
  // - DictionaryExpression
  // - IdentifierExpression
  // - FunctionExpression
  // - PathExpression
  // - AttachExpression
  precedenceLiteral: 17,

  precedenceDeclaration: 1,
};

module.exports = grammar({
  name: "cadence",

  extras: ($) => [
    $.LineComment,
    $.blockComment,
    /[\s\uFEFF\u2060\u200B]/, //TODO:@bluesign check me
    /\n\t/,
  ],
  //word: $=>$._identifier,
  supertypes: ($) => [$.expression, $.declaration],
  conflicts: ($) => [
    [$.ConditionalExpression, $.MemberExpression, $.NegateExpression],
    [$.InvocationExpression, $.NegateExpression, $.BinaryExpressionRelational],
    [$.MemberExpression, $.DestroyExpression, $.ConditionalExpression],
    [$.InvocationExpression, $.DestroyExpression, $.BinaryExpressionRelational],
    [$.MemberExpression, $.UnaryMoveExpression, $.ConditionalExpression],
    [
      $.InvocationExpression,
      $.UnaryMoveExpression,
      $.BinaryExpressionRelational,
    ],
    [
      $.InvocationExpression,
      $.UnaryMoveExpression,
      $.BinaryExpressionRelational,
    ],

    [$._TypeHintOpen, $.Less],

    [$.FunctionExpression],
    [$.TypeAnnotation],
    [$.BinaryExpressionRelational],
    [$.VariableDeclaration],
    [$.FunctionDeclaration],
    [$.ExpressionStatement, $.AssignmentStatement],

    [$.RestrictedType, $.TypeAnnotation],
    [$.EmitStatement, $.expression],
    [$._Restrictions, $._BasicType],
    [$.nestedFunctionDeclaration, $.FunctionDeclaration],

    [$.MemberExpression, $.BitwiseExpressionXor, $.ConditionalExpression],
    [$.MemberExpression, $.BitwiseExpressionOr, $.ConditionalExpression],
    [$.MemberExpression, $.BinaryExpressionAnd, $.ConditionalExpression],
    [$.MemberExpression, $.AdditiveExpression, $.ConditionalExpression],
    [$.MemberExpression, $.BitwiseExpressionShift, $.ConditionalExpression],
    [$.MemberExpression, $.BinaryExpressionEquality, $.ConditionalExpression],

    [$.MemberExpression, $.BinaryExpressionOr, $.ConditionalExpression],
    [$.MemberExpression, $.NilCoalescingExpression, $.ConditionalExpression],
    [$.MemberExpression, $.MultiplicativeExpression, $.ConditionalExpression],
    [$.MemberExpression, $.BitwiseExpressionAnd, $.ConditionalExpression],

    [
      $.InvocationExpression,
      $.BitwiseExpressionOr,
      $.BinaryExpressionRelational,
    ],
    [
      $.InvocationExpression,
      $.BitwiseExpressionXor,
      $.BinaryExpressionRelational,
    ],
    [
      $.InvocationExpression,
      $.NilCoalescingExpression,
      $.BinaryExpressionRelational,
    ],
    [
      $.InvocationExpression,
      $.MultiplicativeExpression,
      $.BinaryExpressionRelational,
    ],
    [
      $.InvocationExpression,
      $.AdditiveExpression,
      $.BinaryExpressionRelational,
    ],
    [
      $.InvocationExpression,
      $.BitwiseExpressionShift,
      $.BinaryExpressionRelational,
    ],
    [
      $.InvocationExpression,
      $.BitwiseExpressionAnd,
      $.BinaryExpressionRelational,
    ],

    [$.MemberExpression, $.BinaryExpressionRelational, $.ConditionalExpression],
  ],
  rules: {
    Program: ($) => field("Declarations", $._Declarations),

    _eos: (_) => repeat1(choice(";")),

    // blockComment: _ => /\/[*]+([^*]|([*][^/]))*[*]+\//,
    LineComment: ($) => /\/\/.*[\n\r]/,

    blockComment: ($) => token(seq("/*", /[^*]*\*+([^/*][^*]*\*+)*/, "/")),

    _positiveFixedPointLiteral: (_) =>
      prec(2, /([0-9_]*[0-9])\.[0-9]([0-9_]*[0-9])?/),
    _decimalLiteral: (_) => seq(/[0-9]/, /[0-9_]*/),
    _binaryLiteral: (_) => seq(/'0b'/, /[01_]+/),
    _octalLiteral: (_) => seq(/'0o'/, /[0-7_]+/),

    _escapedCharacter: ($) =>
      choice(
        seq("\\", /[0\tnr"']/),
        seq("\\u", "{", repeat1($._hexadecimalDigit), "}"),
      ),
    _hexadecimalDigit: (_) => /[0-9a-fA-F]/,
    _quotedText: ($) => choice($._escapedCharacter, /[^"\n\r\\]/, /\s/, /\//),

    HexadecimalLiteral: (_) => seq(/0x[0-9a-fA-F]+/),
    StringLiteral: ($) =>
      seq(
        '"',
        field(
          "Value",
          repeat(
            choice(
              token.immediate("/*"),
              token.immediate(/[^\\"]+/),
              $._quotedText,
            ),
          ),
        ),
        token.immediate('"'),
      ),

    _Declarations: ($) => repeat1(seq($.declaration, optional($._eos))),

    //Identifier
    Identifier: ($) => /[a-zA-Z_]([0-9a-zA-Z_]*)?/,

    //Access
    Access: ($) =>
      choice(
        "priv",
        seq("pub", optional(seq($._OpenParen, "set", $._CloseParen))),
        seq(
          "access",
          $._OpenParen,
          choice("self", "contract", "account", "all"),
          $._CloseParen,
        ),
      ),

    //type
    // @bluesign: this one cannot contain @ prefix.
    ReferenceType: ($) =>
      prec(
        10,
        seq(
          field("Authorized", optional("auth ")),
          $._ReferenceAnnotation,
          field("ReferencedType", choice($._BasicType, $.RestrictedType)),
        ),
      ),

    _Restrictions: ($) =>
      seq(
        $._OpenCurly,
        choice(commaSep1($.NominalType), $.NominalType),
        $._CloseCurly,
      ),

    InstantiationType: ($) =>
      seq(
        field("InstantiatedType", $.TypeAnnotation),
        field("TypeArguments", $._TypeArguments),
      ),

    RestrictedType: ($) =>
      seq(
        field("RestrictedType", optional($._type)),
        field("Restrictions", $._Restrictions),
      ),

    OptionalType: ($) =>
      seq(field("ElementType", $._type), $.OptionalOperator_Immediate),

    _type: ($) =>
      choice(
        $._BasicType,
        $.FunctionType,
        $.ReferenceType,
        $.OptionalType,
        $.RestrictedType,
        $.InstantiationType,
      ),

    _BasicType: ($) =>
      choice(
        $.NominalType,
        $.VariableSizedType,
        $.ConstantSizedType,
        $.DictionaryType,
      ),

    //type annotation
    TypeAnnotation: ($) =>
      choice(
        seq(
          field("IsResource", $.ResourceAnnotation),
          field("AnnotatedType", commaSep1($._type)),
        ),
        seq(field("AnnotatedType", commaSep1($._type))),
      ),

    VariableKind: (_) => choice("let", "var"),

    TransferOperationCopy: (_) => "=",
    TransferOperationMove: (_) => "<-",
    TransferOperatioMoveForced: (_) => "<-!",
    Move: (_) => "<-",

    Transfer: ($) =>
      choice(
        field("Operation", $.TransferOperationCopy),
        field("Operation", $.TransferOperationMove),
        field("Operation", $.TransferOperatioMoveForced),
      ),

    //variable declaration
    VariableDeclaration: ($) =>
      prec(
        P.precedenceDeclaration,
        seq(
          field("Access", optional($.Access)),
          field("VariableKind", $.VariableKind),
          field("Identifier", $.Identifier),
          optional(
            seq($._SemiColon, field("TypeAnnotation", $.TypeAnnotation)),
          ),
          field("Transfer", $.Transfer),
          field("Value", $.expression),
          optional(
            seq(
              //@bluesign: used in resource move only
              field("SecondTransfer", $.Transfer),
              field("SecondValue", $.expression),
            ),
          ),
        ),
      ),

    Parameter: ($) =>
      prec(
        10,
        seq(
          field("Label", optional($.Identifier)),
          field("Identifier", $.Identifier),
          $._SemiColon,
          field("TypeAnnotation", $.TypeAnnotation),
        ),
      ),

    _hiddenComma: (_) => ",",
    //@bluesign: trailing comma is valid in parameter list
    _Parameters: ($) =>
      prec.left(seq(commaSep1($.Parameter), optional($._hiddenComma))),

    ParameterList: ($) =>
      seq(
        $._OpenParen,
        field("Parameters", seq(optional($._Parameters))),
        $._CloseParen,
      ),

    nestedFunctionDeclaration: ($) =>
      prec.left(
        P.precedenceDeclaration,
        seq(
          field("Access", optional($.Access)),
          $._Fun,
          field("Identifier", $.Identifier),
          field("ParameterList", $.ParameterList),
          field(
            "ReturnTypeAnnotation",
            optional(seq($._SemiColon, $.TypeAnnotation)),
          ),
          field("FunctionBlock", $.FunctionBlock),
        ),
      ),

    stringLocation: ($) => $.StringLiteral,
    AddressLocation: ($) => seq(field("Address", $.HexadecimalLiteral)),

    ImportDeclaration: ($) =>
      prec(
        P.precedenceDeclaration,
        seq(
          $._Import,
          field("Identifiers", optional(seq(commaSep1($.Identifier), $._From))),
          field(
            "Location",
            choice($.stringLocation, $.AddressLocation, $.Identifier),
          ),
        ),
      ),

    CompositeKind: (_) => choice("struct", "resource", "contract"),

    _Conformances: ($) => commaSep1($.NominalType),

    CompositeDeclaration: ($) =>
      prec(
        P.precedenceDeclaration,
        seq(
          field("Access", $.Access),
          field("CompositeKind", $.CompositeKind),
          field("Identifier", $.Identifier),
          optional($._SemiColon),
          field("Conformances", optional($._Conformances)),
          $._OpenCurly,
          field("Members", optional($.Members)),
          $._CloseCurly,
        ),
      ),

    InterfaceDeclaration: ($) =>
      prec(
        P.precedenceDeclaration,
        seq(
          field("Access", $.Access),
          field("CompositeKind", $.CompositeKind),
          "interface",
          field("Identifier", $.Identifier),
          $._OpenCurly,
          field("Members", optional($.Members)),
          $._CloseCurly,
        ),
      ),

    EventDeclaration: ($) =>
      prec(
        P.precedenceDeclaration,
        seq(
          field("Access", $.Access),
          "event",
          field("Identifier", $.Identifier),
          field("ParameterList", $.ParameterList),
        ),
      ),

    EnumDeclaration: ($) =>
      prec(
        P.precedenceDeclaration,
        seq(
          field("Access", $.Access),
          "enum",
          field("Identifier", $.Identifier),
          $._SemiColon,
          field("typeAnnotation", $.NominalType),
          $._OpenCurly,
          field("Declarations", repeat($.EnumCaseDeclaration)),
          $._CloseCurly,
        ),
      ),

    EnumCaseDeclaration: ($) =>
      seq(field("Access", $.Access), "case", field("Identifier", $.Identifier)),

    prepare: ($) => $.SpecialFunctionDeclaration,
    execute: ($) => seq($.Identifier, $._OpenCurly, $.Block, $._CloseCurly),

    FunctionDeclaration_: ($) =>
      seq(
        field("Access", optional($.Access)),
        field("Identifier", choice("prepare", "init", "destroy")),
        field("ParameterList", $.ParameterList),
        field("FunctionBlock", optional($.FunctionBlock)),
      ),

    SpecialFunctionDeclaration: ($) =>
      prec(
        P.precedenceDeclaration,
        seq(field("FunctionDeclaration", $.FunctionDeclaration_)),
      ),

    FunctionDeclaration: ($) =>
      prec(
        P.precedenceDeclaration,
        seq(
          field("Access", $.Access),
          field("View", optional("view")),
          $._Fun,
          field("Identifier", $.Identifier),
          field("ParameterList", $.ParameterList),
          optional(
            seq($._SemiColon, field("ReturnTypeAnnotation", $.TypeAnnotation)),
          ),
          optional("\n"),
          field("FunctionBlock", optional($.FunctionBlock)),
        ),
      ),

    transactionDeclaration: ($) =>
      prec(
        P.precedenceDeclaration,
        seq(
          "transaction",
          field("ParameterList", optional($.ParameterList)),
          $._OpenCurly,
          field("Fields", optional($.Fields)),
          field("prepare", optional($.prepare)),
          field("PreConditions", optional($.PreConditions)),
          optional(
            choice(
              field("execute", $.execute),
              seq(
                field("execute", $.execute),
                field("PostConditions", $._PostConditions),
              ),
              $._PostConditions,
              seq(
                field("PostConditions", $._PostConditions),
                field("execute", $.execute),
              ),
            ),
          ),
          $._CloseCurly,
        ),
      ),

    pragmaDeclaration: ($) =>
      prec(P.precedenceDeclaration, seq("#", $.expression)),

    declaration: ($) =>
      choice(
        $.VariableDeclaration,
        $.FunctionDeclaration,
        $.ImportDeclaration,
        $.CompositeDeclaration,
        $.InterfaceDeclaration,
        $.EventDeclaration,
        $.transactionDeclaration,
        $.pragmaDeclaration,
        $.EnumDeclaration,
      ),

    FieldDeclaration: ($) =>
      prec(
        P.precedenceDeclaration,
        seq(
          field("Access", $.Access),
          field("VariableKind", optional($.VariableKind)),
          field("Identifier", $.Identifier),
          $._SemiColon,
          field("TypeAnnotation", $.TypeAnnotation),
        ),
      ),

    Fields: ($) => prec.right(repeat1(seq($.FieldDeclaration, optional(";")))),

    Members: ($) => seq(field("Declarations", $._MemberOrNestedDeclaration)),

    _MemberOrNestedDeclaration: ($) =>
      repeat1(
        seq(
          choice(
            $.FieldDeclaration,
            $.SpecialFunctionDeclaration,
            $.FunctionDeclaration,
            $.InterfaceDeclaration,
            $.CompositeDeclaration,
            $.EventDeclaration,
            $.pragmaDeclaration,
            $.EnumDeclaration,
          ),
          optional($._eos),
        ),
      ),

    NominalType: ($) =>
      prec.right(
        seq(
          seq(
            field("Identifier", $.Identifier),
            optional(
              repeat(seq(".", field("NestedIdentifiers", $.Identifier))),
            ),
          ),
        ),
      ),

    FunctionType: ($) =>
      seq(
        $._OpenParen,
        optional($._Fun), //TODO: @bluesign check this
        $._OpenParen,
        commaSep1($.TypeAnnotation),
        $._CloseParen,
        $._SemiColon,
        $.TypeAnnotation,
        $._CloseParen,
      ),

    VariableSizedType: ($) => seq("[", field("ElementType", $._type), "]"),

    ConstantSizedType: ($) =>
      seq(
        "[",
        field("ElementType", $._type),
        ";",
        field("Size", $.IntegerLiteral),
        "]",
      ),

    DictionaryType: ($) =>
      seq(
        $._OpenCurly,
        field("KeyType", $._type),
        $._SemiColon,
        field("ValueType", $._type),
        $._CloseCurly,
      ),

    Block: ($) => seq(field("Statements", $._Statements)),

    FunctionBlock: ($) =>
      seq(
        $._OpenCurly,
        field("PreConditions", optional($.PreConditions)),
        field("PostConditions", optional($._PostConditions)),
        field("Block", optional($.Block)),
        $._CloseCurly,
      ),

    PreConditions: ($) =>
      seq($._Pre, $._OpenCurly, $._Conditions, $._CloseCurly),

    _PostConditions: ($) =>
      seq($._Post, $._OpenCurly, $._Conditions, $._CloseCurly),

    _Conditions: ($) => repeat1(seq($.Condition)),

    Condition: ($) =>
      seq(
        field("Test", $.expression),
        optional(
          seq(
            optional("\n"),
            $._SemiColon,
            optional("\n"),
            field("Message", choice($.expression)),
          ),
        ),
        optional($._eos),
      ),

    _Statements: ($) =>
      prec.left(
        repeat1(
          choice(
            seq($._Statement, optional($._eos)),
            seq($._Statement, optional($._eos)),
          ),
        ),
      ),

    _Statement: ($) =>
      choice(
        $.ExpressionStatement,
        $.nestedFunctionDeclaration,
        $.SwitchStatement,
        $.ReturnStatement,
        $.BreakStatement,
        $.ContinueStatement,
        $.IfStatement,
        $.WhileStatement,
        $.ForStatement,
        $.EmitStatement,
        $.declaration,
        $.AssignmentStatement,
        $.SwapStatement,
      ),

    ExpressionStatement: ($) => seq(field("Expression", $.expression)),

    ReturnStatement: ($) =>
      prec.right(seq("return", field("Expression", optional($.expression)))),

    BreakStatement: (_) => "break",

    ContinueStatement: (_) => "continue",

    IfStatement: ($) =>
      seq(
        $._If,
        field("Test", choice($.expression, $.VariableDeclaration)),
        $._OpenCurly,
        field("Then", $.Block),
        $._CloseCurly,
        optional(
          seq(
            $._Else,
            field(
              "Else",
              choice($.IfStatement, seq($._OpenCurly, $.Block, $._CloseCurly)),
            ),
          ),
        ),
      ),

    WhileStatement: ($) =>
      seq("while", $.expression, $._OpenCurly, $.Block, $._CloseCurly),

    ForStatement: ($) =>
      seq(
        "for",
        field("Identifier", commaSep1($.Identifier)),
        "in",
        field("Expression", $.expression),
        $._OpenCurly,
        field("Block", $.Block),
        $._CloseCurly,
      ),

    EmitStatement: ($) =>
      seq("emit", field("InvocationExpression", $.InvocationExpression)),

    AssignmentStatement: ($) =>
      seq(
        field("Target", $.expression),
        field("Transfer", $.Transfer),
        field("Value", $.expression),
      ),

    SwapStatement: ($) => prec(100, seq($.expression, "<->", $.expression)),

    FunctionExpression: ($) =>
      prec(
        1070,
        seq(
          optional($._OpenParen),
          optional($._Fun),
          field("ParameterList", $.ParameterList),
          field(
            "ReturnTypeAnnotation",
            optional(seq($._SemiColon, $.TypeAnnotation)),
          ),
          $.FunctionBlock,
          optional($._CloseParen),
        ),
      ),

    NestedExpression: ($) =>
      prec(
        P.precedenceAccess,
        seq($._OpenParen, field("Expression", $.expression), $._CloseParen),
      ),

    OptionalOperator: (_) => "?",
    OptionalOperator_Immediate: (_) => token.immediate("?"),

    MemberExpression: ($) =>
      prec(
        P.precedenceAccess,
        seq(
          field("Expression", $.expression),
          field("Optional", optional($.OptionalOperator)),
          ".",
          field("Identifier", $.Identifier),
        ),
      ),

    IndexExpression: ($) =>
      prec(
        P.precedenceAccess,
        seq(
          field("TargetExpression", $.expression),
          "[",
          field("IndexingExpression", $.expression),
          "]",
        ),
      ),

    _TypeHintOpen: (_) => "<",
    _TypeHintClose: (_) => ">",

    _TypeArguments: ($) =>
      seq($._TypeHintOpen, commaSep1($.TypeAnnotation), $._TypeHintClose),

    Invocation: ($) =>
      seq(
        $._OpenParen,
        field("Arguments", optional($._Arguments)),
        optional(","),
        $._CloseParen,
      ),

    _Arguments: ($) => commaSep1($.Argument),

    //                optional(','), //TODO: check bug
    InvocationExpression: ($) =>
      prec(
        P.precedenceAccess,
        seq(
          field("InvokedExpression", $.expression),
          field("TypeArguments", optional($._TypeArguments)),
          $._OpenParen,
          field("Arguments", optional($._Arguments)),
          $._CloseParen,
        ),
      ),

    //Unary precedence: -, !, <-

    //postfix
    ForceExpression: ($) =>
      prec(
        P.precedenceUnaryPostfix,
        seq(field("Expression", $.expression), token.immediate("!")),
      ),

    //prefix
    UnaryMoveExpression: ($) =>
      prec(
        P.precedenceUnaryPrefix,
        seq(field("Operation", $.Move), field("Expression", $.expression)),
      ),

    //unary
    NegateExpression: ($) =>
      prec(
        P.precedenceUnaryPrefix,
        seq("!", field("Expression", $.expression)),
      ),

    CreateExpression: ($) =>
      prec(
        P.precedenceUnaryPrefix,
        seq($._Create, field("InvocationExpression", $.InvocationExpression)),
      ),

    DestroyExpression: ($) =>
      prec(
        P.precedenceUnaryPrefix,
        seq($._Destroy, field("Expression", $.expression)),
      ),

    //TODO: check
    ReferenceExpression: ($) =>
      prec(
        P.precedenceUnaryPrefix,
        seq(
          $._ReferenceAnnotation,
          field("Expression", $.expression),
          choice($.Casting, $.ForceCasting, $.FailableCasting),
          field("TargetType", $._type),
        ),
      ),

    castingOp: ($) => choice($.Casting, $.FailableCasting, $.ForceCasting),

    // Cast precedence: as, as?, as!
    CastingExpression: ($) =>
      prec(
        P.precedenceCasting,
        seq(
          field("Expression", $.expression),
          field("Operation", $.castingOp),
          field("TypeAnnotation", $.TypeAnnotation),
        ),
      ),

    // Multiplication precedence: *, /, %
    Mul: (_) => "*",
    Div: (_) => "/",
    Mod: (_) => "%",

    MultiplicativeOp: ($) => choice($.Mul, $.Div, $.Mod),

    MultiplicativeExpression: ($) =>
      prec.left(
        P.precedenceMultiplication,
        seq(
          field("Left", $.expression),
          field("Operation", $.MultiplicativeOp),
          field("Right", $.expression),
        ),
      ),

    // Addition precedence: +, -
    Plus: (_) => "+",
    Minus: (_) => "-",

    AdditiveOp: ($) => choice($.Plus, $.Minus),

    AdditiveExpression: ($) =>
      prec.left(
        P.precedenceAddition,
        seq(
          field("Left", $.expression),
          field("Operation", $.AdditiveOp),
          field("Right", $.expression),
        ),
      ),

    //Bitwise shift precedence: <<, >>
    ShiftLeft: (_) => "<<",
    ShiftRight: (_) => ">>",

    BitwiseShiftOp: ($) => choice($.ShiftLeft, $.ShiftRight),

    BitwiseExpressionShift: ($) =>
      prec.left(
        P.precedenceBitwiseShift,
        seq(
          field("Left", $.expression),
          field("Operation", $.BitwiseShiftOp),
          field("Right", $.expression),
        ),
      ),

    //Bitwise conjunction precedence: &
    BitwiseAnd: (_) => "&",

    BitwiseExpressionAnd: ($) =>
      prec.left(
        P.precedenceBitwiseAnd,
        seq(
          field("Left", $.expression),
          field("Operation", $.BitwiseAnd),
          field("Right", $.expression),
        ),
      ),

    //Bitwise exclusive disjunction precedence: ^
    BitwiseXor: (_) => "^",

    BitwiseExpressionXor: ($) =>
      prec.left(
        P.precedenceBitwiseXor,
        seq(
          field("Left", $.expression),
          field("Operation", $.BitwiseXor),
          field("Right", $.expression),
        ),
      ),

    // Bitwise disjunction precedence: |
    BitwiseOr: (_) => "|",

    BitwiseExpressionOr: ($) =>
      prec.left(
        P.precedenceBitwiseOr,
        seq(
          field("Left", $.expression),
          field("Operation", $.BitwiseOr),
          field("Right", $.expression),
        ),
      ),

    //Nil-Coalescing precedence: ??  right associative!
    NilCoalescingExpression: ($) =>
      prec.right(
        P.precedenceNilCoalescing,
        seq(
          field("Left", $.expression),
          field("Operation", $.NilCoalescing),
          field("Right", $.expression),
        ),
      ),

    //Relational precedence: <, <=, >, >=
    Less: (_) => "<",
    Greater: (_) => ">",
    LessEqual: (_) => "<=",
    GreaterEqual: (_) => ">=",

    RelationalOP: ($) => choice($.Less, $.Greater, $.LessEqual, $.GreaterEqual),

    BinaryExpressionRelational: ($) =>
      prec(
        P.precedenceComparison,
        seq(
          field("Left", $.expression),
          field("Operation", $.RelationalOP),
          field("Right", $.expression),
        ),
      ),

    //Equality precedence: ==, !=
    Equal: (_) => "==",
    Unequal: (_) => "!=",

    EqualityOp: ($) => choice($.Equal, $.Unequal),

    BinaryExpressionEquality: ($) =>
      prec.left(
        P.precedenceComparisonEqual,
        seq(
          field("Left", $.expression),
          field("Operation", $.EqualityOp),
          field("Right", $.expression),
        ),
      ),

    //Logical conjunction precedence: &&
    LogicalAnd: (_) => "&&",

    BinaryExpressionAnd: ($) =>
      prec.left(
        P.precedenceLogicalAnd,
        seq(
          field("Left", $.expression),
          field("Operation", $.LogicalAnd),
          field("Right", $.expression),
        ),
      ),

    //Logical disjunction precedence: ||
    LogicalOr: (_) => "||",

    BinaryExpressionOr: ($) =>
      prec.left(
        P.precedenceLogicalOr,
        seq(
          field("Left", $.expression),
          field("Operation", $.LogicalOr),
          field("Right", $.expression),
        ),
      ),

    //Ternary precedence: ? :*/
    ConditionalExpression: ($) =>
      prec.right(
        P.precedenceTernary,
        seq(
          field("Test", $.expression),
          "?",
          field("Then", $.expression),
          $._SemiColon,
          field("Else", $.expression),
        ),
      ),

    IdentifierExpression: ($) =>
      prec.left(P.precedenceLiteral, field("Identifier", choice($.Identifier))),

    StringExpression: ($) =>
      prec.left(P.precedenceLiteral, seq(field("Value", $.StringLiteral))),

    BooleanLiteral: ($) => choice($.True, $.False),

    BooleanExpression: ($) =>
      prec(P.precedenceLiteral, seq(field("Value", $.BooleanLiteral))),

    NilLiteral: (_) => "nil",

    NilExpression: ($) =>
      prec(P.precedenceLiteral, seq(field("Value", $.NilLiteral))),

    _PathSeparator: (_) => "/",
    _PathSeparator_Immediate: (_) => "/",

    PathExpression: ($) =>
      prec(
        P.precedenceLiteral,
        seq(
          $._PathSeparator,
          field("Domain", $.Identifier),
          $._PathSeparator_Immediate,
          field("Identifier", $.Identifier),
        ),
      ),

    FixedPointLiteral: ($) =>
      seq(optional($.Minus), $._positiveFixedPointLiteral),

    FixedPointExpression: ($) =>
      prec(P.precedenceLiteral, seq(field("Value", $.FixedPointLiteral))),

    _positiveIntegerLiteral: ($) =>
      choice(
        $._decimalLiteral,
        $._binaryLiteral,
        $._octalLiteral,
        $.HexadecimalLiteral,
      ),

    IntegerLiteral: ($) => seq(optional($.Minus), $._positiveIntegerLiteral),

    IntegerExpression: ($) =>
      prec(
        P.precedenceLiteral,
        choice(
          field("Value", $.IntegerLiteral),
          field("Value", $.HexadecimalLiteral),
        ),
      ),

    ArrayExpression: ($) =>
      prec(
        P.precedenceLiteral,
        seq("[", field("Values", commaSep($.expression)), "]"),
      ),

    DictionaryExpression: ($) =>
      prec(
        P.precedenceLiteral,
        seq($._OpenCurly, commaSep($.dictionaryEntry), $._CloseCurly),
      ),

    dictionaryEntry: ($) => seq($.expression, $._SemiColon, $.expression),

    expression: ($) =>
      choice(
        $.NestedExpression,
        $.BooleanExpression,
        $.NilExpression,
        $.StringExpression,
        $.IntegerExpression,
        $.FixedPointExpression,
        $.ArrayExpression,
        $.DictionaryExpression,
        $.IdentifierExpression,
        $.FunctionExpression,
        $.PathExpression,
        // TODO: AttachExpression
        $.IndexExpression,
        $.InvocationExpression,
        $.MemberExpression,
        $.ForceExpression,
        $.UnaryMoveExpression,
        $.NegateExpression,
        $.CreateExpression,
        $.DestroyExpression,
        $.ReferenceExpression,
        $.CastingExpression,
        $.MultiplicativeExpression,
        $.AdditiveExpression,
        $.BitwiseExpressionShift,
        $.BitwiseExpressionAnd,
        $.BitwiseExpressionXor,
        $.BitwiseExpressionOr,
        $.NilCoalescingExpression,
        $.BinaryExpressionEquality,
        $.BinaryExpressionRelational,
        $.BinaryExpressionAnd,
        $.BinaryExpressionOr,
        $.ConditionalExpression,
      ),

    Auth: (_) => "auth",
    _ReferenceAnnotation: (_) => "&",

    _Negate: (_) => "!",

    _Optional: (_) => "?",

    NilCoalescing: (_) => "??",

    Casting: (_) => "as",
    FailableCasting: (_) => "as?",
    ForceCasting: (_) => "as!",

    ResourceAnnotation: (_) => "@",

    Argument: ($) =>
      seq(
        optional(seq(field("Label", $.Identifier), $._SemiColon)),
        field("Expression", $.expression),
      ),

    _OpenCurly: (_) => "{",
    _OpenCurly_Immidiate: (_) => token.immediate("{"),
    _CloseCurly: (_) => "}",

    _OpenParen: (_) => "(",
    _CloseParen: (_) => ")",
    _Struct: (_) => token("struct "),
    _Resource: (_) => token("resource "),
    _Contract: (_) => token("contract "),
    _Interface: (_) => token("interface "),
    _Fun: (_) => token("fun"),
    _Event: (_) => "event ",
    _Emit: (_) => "emit ",
    _Pre: (_) => "pre",
    _Post: (_) => "post",
    _Priv: (_) => "priv",
    _Pub: (_) => "pub ",
    _Set: (_) => "set",
    _Access: (_) => "access",
    _All: (_) => "all",
    _Account: (_) => "account",
    _Return: (_) => "return",
    _Break: (_) => "break",
    _Continue: (_) => "continue",
    _Let: (_) => "let ",
    _Var: (_) => "var ",
    _If: (_) => "if",
    _Else: (_) => "else",
    _While: (_) => "while",
    _For: (_) => "for",
    _In: (_) => "in ",
    True: (_) => "true",
    False: (_) => "false",
    _Nil: (_) => "nil",
    _Import: (_) => "import ",
    _From: (_) => "from ",
    _Create: (_) => "create ",
    _Destroy: (_) => "destroy ",
    _SemiColon: (_) => ":",

    SwitchCase: ($) =>
      seq(
        choice(
          seq("case", field("Expression", $.expression)),
          field("Expression", "default"),
        ),
        ":",
        field("Statements", optional($._Statements)),
      ),

    SwitchStatement: ($) =>
      seq(
        "switch",
        field("Expression", $.expression),
        "{",
        field("Cases", repeat($.SwitchCase)),
        "}",
      ),
  },
});
