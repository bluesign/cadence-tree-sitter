//
function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)));
}

//
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
  precedenceComparisonEqual: 4, // TODO:check
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

  optionalType: 18,
  resourceType: 19,
  otherType: 20,

  precedenceDeclaration: 1,
};

module.exports = grammar({
  name: 'cadence',

  extras: ($) => [
    $.Comment,
    /[\s\uFEFF\u2060\u200B]/, // TODO:@bluesign check me
    /\n\t/,
  ],
  // word: $=>$._identifier,
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
    [$.TypeIdentifier, $.Identifier],


    [$.FunctionExpression],
    [$.BinaryExpressionRelational],
    [$.VariableDeclaration],
    [$.FunctionDeclaration],
    [$.ExpressionStatement, $.AssignmentStatement],

    [$.EmitStatement, $.expression],
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
    Program: ($) => optional($._Declarations),

    _eos: (_) => repeat1(choice(';')),

    Comment: (_) => token(choice(
      seq('//', /.*/),
      seq(
        '/*',
        /[^*]*\*+([^/*][^*]*\*+)*/,
        '/',
      ),
    )),

    _positiveFixedPointLiteral: (_) =>
      prec(2, /([0-9_]*[0-9])\.[0-9]([0-9_]*[0-9])?/),
    _decimalLiteral: (_) => seq(/[0-9]/, /[0-9_]*/),
    _binaryLiteral: (_) => seq(/'0b'/, /[01_]+/),
    _octalLiteral: (_) => seq(/'0o'/, /[0-7_]+/),

    _escapedCharacter: ($) =>
      choice(
        seq('\\', /[0\tnr"']/),
        seq('\\u', '{', repeat1($._hexadecimalDigit), '}'),
      ),
    _hexadecimalDigit: (_) => /[0-9a-fA-F]/,
    _quotedText: ($) => choice($._escapedCharacter, /[^"\n\r\\]/, /\s/, /\//),

    HexadecimalLiteral: (_) => seq(/0x[0-9a-fA-F]+/),
    StringLiteral: ($) =>
      seq(
        '"',
        field(
          'Value',
          repeat(
            choice(
              token.immediate('/*'),
              token.immediate(/[^\\"]+/),
              $._quotedText,
            ),
          ),
        ),
        token.immediate('"'),
      ),

    _Declarations: ($) => repeat1(seq($.declaration, optional($._eos))),

    Identifier: ($) => /[a-zA-Z_]([0-9a-zA-Z_]*)?/,
    TypeBuiltin: ($) => choice(
      'Bool',
      'String',
      'Address',
      'AnyStruct',
      'AnyResource',
      'Never',
      'Character',
      'Void',
      'Int', 'Int8', 'Int16', 'Int32', 'Int64', 'Int128', 'Int256',
      'UInt', 'UInt8', 'UInt16', 'UInt32', 'UInt64', 'UInt128', 'UInt256',
      'Word8', 'Word16', 'Word32', 'Word64', 'Word128', 'Word256',
      'Fix64', 'UFix64',
    ),
    TypeIdentifier: ($) => choice($.TypeBuiltin, /[a-zA-Z_]([0-9a-zA-Z_]*)?/),

    // TODO: Entitlements
    Entitlements: ($) => choice('self', 'contract', 'account', 'all', $.Identifier),

    // Access
    Access: ($) =>
      choice(
        seq(
          'access',
          '(',
          $.Entitlements,
          ')',
        ),
      ),

    // type
    // @bluesign: this one cannot contain @ prefix.
    ReferenceType: ($) =>
      prec(
        10,
        seq(
          field('Authorized', optional('auth ')),
          $._ReferenceAnnotation,
          field('ReferencedType', choice($._BasicType, $.RestrictedType)),
        ),
      ),

    AuthorizedType: ($) => seq('auth', '(', $.Entitlements, ')', $.ReferenceType),

    _Restrictions: ($) =>
      seq(
        '{',
        choice(commaSep1($.NominalType), $.NominalType),
        '}',
      ),

    InstantiationType: ($) =>
      seq(
        field('InstantiatedType', $._type),
        field('TypeArguments', $._TypeArguments),
      ),

    RestrictedType: ($) =>
      seq(
        field('RestrictedType', optional($._type)),
        field('Restrictions', $._Restrictions),
      ),

    ResourceType: ($) =>
      prec(
        P.resourceType,
        seq(
          '@',
          $._type,
        ),
      ),

    OptionalType: ($) =>
      prec(
        P.optionalType,
        seq(
          field('ElementType', $._type),
          $._OptionalOperator_Immediate,
        ),
      ),

    _type: ($) =>
      choice(
        $._BasicType,
        $.FunctionType,
        $.AuthorizedType,
        $.ReferenceType,
        $.OptionalType,
        $.ResourceType,
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

    VariableKind: (_) => choice('let', 'var'),

    TransferOperationCopy: (_) => '=',
    TransferOperationMove: (_) => '<-',
    TransferOperatioMoveForced: (_) => '<-!',
    Move: (_) => '<-',

    Transfer: ($) =>
      choice(
        field('Operation', $.TransferOperationCopy),
        field('Operation', $.TransferOperationMove),
        field('Operation', $.TransferOperatioMoveForced),
      ),

    // variable declaration
    VariableDeclaration: ($) =>
      prec(
        P.precedenceDeclaration,
        seq(
          field('Access', optional($.Access)),
          field('VariableKind', $.VariableKind),
          field('Identifier', $.Identifier),
          optional(
            seq(':', field('type', $._type)),
          ),
          field('Transfer', $.Transfer),
          field('Value', $.expression),
          optional(
            seq(
              // @bluesign: used in resource move only
              field('SecondTransfer', $.Transfer),
              field('SecondValue', $.expression),
            ),
          ),
        ),
      ),

    Parameter: ($) =>
      prec(
        10,
        seq(
          field('Label', optional($.Identifier)),
          field('Identifier', $.Identifier),
          ':',
          field('type', $._type),
        ),
      ),

    _hiddenComma: (_) => ',',
    // @bluesign: trailing comma is valid in parameter list
    _ParameterList: ($) =>
      seq(
        '(',
        seq(optional(prec.left(seq(commaSep1($.Parameter), optional($._hiddenComma))))),
        ')',
      ),

    nestedFunctionDeclaration: ($) =>
      prec.left(
        P.precedenceDeclaration,
        seq(
          field('Access', optional($.Access)),
          'fun',
          field('Identifier', $.Identifier),
          field('parameters', $._ParameterList),
          field(
            'type',
            optional(seq(':', $._type)),
          ),
          $._FunctionBlock,
        ),
      ),

    Address: ($) => seq(field('Address', $.HexadecimalLiteral)),

    ImportDeclaration: ($) =>
      prec(
        P.precedenceDeclaration,
        seq(
          'import',
          optional(
            field(
              'type',
              seq(commaSep1($.TypeIdentifier), 'from'),
            ),
          ),
          field(
            'location',
            choice($.StringLiteral, $.Address),
          ),
        ),
      ),

    _CompositeKind: (_) => choice('struct', 'resource', 'contract'),

    Conformances: ($) => commaSep1($.NominalType),

    CompositeDeclaration: ($) =>
      prec(
        P.precedenceDeclaration,
        seq(
          $.Access,
          field('compositeKind', $._CompositeKind),
          field('type', $.TypeIdentifier),
          optional(':'),
          field('conformances', optional($.Conformances)),
          '{',
          field('members', optional($.Members)),
          '}',
        ),
      ),

    InterfaceDeclaration: ($) =>
      prec(
        P.precedenceDeclaration,
        seq(
          $.Access,
          field('compositeKind', $._CompositeKind),
          'interface',
          field('type', $.TypeIdentifier),
          '{',
          field('members', optional($.Members)),
          '}',
        ),
      ),

    EventDeclaration: ($) =>
      prec(
        P.precedenceDeclaration,
        seq(
          $.Access,
          'event',
          field('Identifier', $.Identifier),
          field('parameters', $._ParameterList),
        ),
      ),

    EnumDeclaration: ($) =>
      prec(
        P.precedenceDeclaration,
        seq(
          $.Access,
          'enum',
          field('Identifier', $.Identifier),
          ':',
          field('typeAnnotation', $.NominalType),
          '{',
          field('Declarations', repeat($.EnumCaseDeclaration)),
          '}',
        ),
      ),

    EnumCaseDeclaration: ($) =>
      seq(
        $.Access,
        'case',
        field('Identifier', $.Identifier),
      ),

    prepare: ($) => $.SpecialFunctionDeclaration,
    execute: ($) => seq('execute', '{', optional($.Block), '}'),

    FunctionDeclaration_: ($) =>
      seq(
        optional($.Access),
        choice('prepare', 'destroy'),
        field('parameters', $._ParameterList),
        optional($._FunctionBlock),
      ),

    InitDeclaration: ($) =>
      seq(
        optional('view'),
        'init',
        field('parameters', $._ParameterList),
        optional($._FunctionBlock),
      ),

    SpecialFunctionDeclaration: ($) =>
      prec(
        P.precedenceDeclaration,
        $.FunctionDeclaration_,
      ),

    FunctionDeclaration: ($) =>
      prec(
        P.precedenceDeclaration,
        seq(
          $.Access,
          optional('view'),
          'fun',
          field('name', $.Identifier),
          field('parameters', $._ParameterList),
          optional(
            seq(':', field('type', $._type)),
          ),
          optional('\n'),
          optional($._FunctionBlock),
        ),
      ),

    transactionDeclaration: ($) =>
      prec(
        P.precedenceDeclaration,
        seq(
          'transaction',
          field('parameters', optional($._ParameterList)),
          '{',
          field('Fields', optional($.Fields)),
          field('prepare', optional($.prepare)),
          field('PreConditions', optional($.PreConditions)),
          optional(
            choice(
              field('execute', $.execute),
              seq(
                field('execute', $.execute),
                field('PostConditions', $._PostConditions),
              ),
              $._PostConditions,
              seq(
                field('PostConditions', $._PostConditions),
                field('execute', $.execute),
              ),
            ),
          ),
          '}',
        ),
      ),

    pragmaDeclaration: ($) =>
      prec(P.precedenceDeclaration, seq('#', $.expression)),

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
          $.Access,
          field('VariableKind', optional($.VariableKind)),
          field('Identifier', $.Identifier),
          ':',
          field('type', $._type),
        ),
      ),

    Fields: ($) => prec.right(repeat1(seq($.FieldDeclaration, optional(';')))),

    Members: ($) => seq(field('Declarations', $._MemberOrNestedDeclaration)),

    _MemberOrNestedDeclaration: ($) =>
      repeat1(
        seq(
          choice(
            $.FieldDeclaration,
            $.SpecialFunctionDeclaration,
            $.InitDeclaration,
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
            field('Identifier', $.TypeIdentifier),
            optional(
              repeat(seq('.', field('NestedIdentifiers', $.TypeIdentifier))),
            ),
          ),
        ),
      ),

    FunctionType: ($) =>
      seq(
        '(',
        optional('fun'), // TODO: @bluesign check this
        '(',
        commaSep1($._type),
        ')',
        ':',
        $._type,
        ')',
      ),

    VariableSizedType: ($) => seq('[', field('ElementType', $._type), ']'),

    ConstantSizedType: ($) =>
      seq(
        '[',
        field('ElementType', $._type),
        ';',
        field('Size', $.IntegerLiteral),
        ']',
      ),

    DictionaryType: ($) =>
      seq(
        '{',
        field('KeyType', $._type),
        ':',
        field('ValueType', $._type),
        '}',
      ),

    Block: ($) => seq(field('Statements', $._Statements)),

    _FunctionBlock: ($) =>
      seq(
        '{',
        field('PreConditions', optional($.PreConditions)),
        field('PostConditions', optional($._PostConditions)),
        field('Block', optional($.Block)),
        '}',
      ),

    PreConditions: ($) =>
      seq('pre', '{', optional($._Conditions), '}'),

    _PostConditions: ($) =>
      seq('post', '{', optional($._Conditions), '}'),

    _Conditions: ($) => repeat1(seq($.Condition)),

    Condition: ($) =>
      seq(
        field('Test', $.expression),
        optional(
          seq(
            optional('\n'),
            ':',
            optional('\n'),
            field('Message', choice($.expression)),
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

    ExpressionStatement: ($) => seq(field('Expression', $.expression)),

    ReturnStatement: ($) =>
      prec.right(seq('return', field('Expression', optional($.expression)))),

    BreakStatement: (_) => 'break',

    ContinueStatement: (_) => 'continue',

    IfStatement: ($) =>
      seq(
        $._If,
        field('Test', choice($.expression, $.VariableDeclaration)),
        '{',
        field('Then', $.Block),
        '}',
        optional(
          seq(
            $._Else,
            field(
              'Else',
              choice($.IfStatement, seq('{', $.Block, '}')),
            ),
          ),
        ),
      ),

    WhileStatement: ($) =>
      seq('while', $.expression, '{', $.Block, '}'),

    ForStatement: ($) =>
      seq(
        'for',
        field('Identifier', commaSep1($.Identifier)),
        'in',
        field('Expression', $.expression),
        '{',
        field('Block', $.Block),
        '}',
      ),

    EmitStatement: ($) =>
      seq('emit', field('InvocationExpression', $.InvocationExpression)),

    AssignmentStatement: ($) =>
      seq(
        field('Target', $.expression),
        field('Transfer', $.Transfer),
        field('Value', $.expression),
      ),

    SwapStatement: ($) => prec(100, seq($.expression, '<->', $.expression)),

    FunctionExpression: ($) =>
      prec(
        1070,
        seq(
          optional('('),
          optional('fun'),
          field('parameters', $._ParameterList),
          field(
            'type',
            optional(seq(':', $._type)),
          ),
          $._FunctionBlock,
          optional(')'),
        ),
      ),

    NestedExpression: ($) =>
      prec(
        P.precedenceAccess,
        seq('(', field('Expression', $.expression), ')'),
      ),

    OptionalOperator: (_) => '?',
    _OptionalOperator_Immediate: (_) => token.immediate('?'),

    MemberExpression: ($) =>
      prec(
        P.precedenceAccess,
        seq(
          field('Expression', $.expression),
          field('Optional', optional($.OptionalOperator)),
          '.',
          field('Identifier', $.Identifier),
        ),
      ),

    IndexExpression: ($) =>
      prec(
        P.precedenceAccess,
        seq(
          field('TargetExpression', $.expression),
          '[',
          field('IndexingExpression', $.expression),
          ']',
        ),
      ),

    _TypeHintOpen: (_) => '<',
    _TypeHintClose: (_) => '>',

    _TypeArguments: ($) =>
      seq($._TypeHintOpen, commaSep1($._type), $._TypeHintClose),

    Invocation: ($) =>
      seq(
        '(',
        field('Arguments', optional($._Arguments)),
        optional(','),
        ')',
      ),

    _Arguments: ($) => commaSep1($.Argument),

    //                optional(','), //TODO: check bug
    InvocationExpression: ($) =>
      prec(
        P.precedenceAccess,
        seq(
          field('InvokedExpression', $.expression),
          field('TypeArguments', optional($._TypeArguments)),
          '(',
          field('Arguments', optional($._Arguments)),
          ')',
        ),
      ),

    // Unary precedence: -, !, <-

    // postfix
    ForceExpression: ($) =>
      prec(
        P.precedenceUnaryPostfix,
        seq(field('Expression', $.expression), token.immediate('!')),
      ),

    // prefix
    UnaryMoveExpression: ($) =>
      prec(
        P.precedenceUnaryPrefix,
        seq(field('Operation', $.Move), field('Expression', $.expression)),
      ),

    // unary
    NegateExpression: ($) =>
      prec(
        P.precedenceUnaryPrefix,
        seq('!', field('Expression', $.expression)),
      ),

    CreateExpression: ($) =>
      prec(
        P.precedenceUnaryPrefix,
        seq(
          'create',
          field('type', $._type),
          '(',
          field('Arguments', optional($._Arguments)),
          ')',
        ),
      ),

    DestroyExpression: ($) =>
      prec(
        P.precedenceUnaryPrefix,
        seq($._Destroy, field('Expression', $.expression)),
      ),

    // TODO: check
    ReferenceExpression: ($) =>
      prec(
        P.precedenceUnaryPrefix,
        seq(
          $._ReferenceAnnotation,
          field('Expression', $.expression),
          choice($.Casting, $.ForceCasting, $.FailableCasting),
          field('TargetType', $._type),
        ),
      ),

    castingOp: ($) => choice($.Casting, $.FailableCasting, $.ForceCasting),

    // Cast precedence: as, as?, as!
    CastingExpression: ($) =>
      prec(
        P.precedenceCasting,
        seq(
          field('Expression', $.expression),
          field('Operation', $.castingOp),
          field('type', $._type),
        ),
      ),

    // Multiplication precedence: *, /, %
    Mul: (_) => '*',
    Div: (_) => '/',
    Mod: (_) => '%',

    MultiplicativeOp: ($) => choice($.Mul, $.Div, $.Mod),

    MultiplicativeExpression: ($) =>
      prec.left(
        P.precedenceMultiplication,
        seq(
          field('Left', $.expression),
          field('Operation', $.MultiplicativeOp),
          field('Right', $.expression),
        ),
      ),

    // Addition precedence: +, -
    Plus: (_) => '+',
    Minus: (_) => '-',

    AdditiveOp: ($) => choice($.Plus, $.Minus),

    AdditiveExpression: ($) =>
      prec.left(
        P.precedenceAddition,
        seq(
          field('Left', $.expression),
          field('Operation', $.AdditiveOp),
          field('Right', $.expression),
        ),
      ),

    // Bitwise shift precedence: <<, >>
    ShiftLeft: (_) => '<<',
    ShiftRight: (_) => '>>',

    BitwiseShiftOp: ($) => choice($.ShiftLeft, $.ShiftRight),

    BitwiseExpressionShift: ($) =>
      prec.left(
        P.precedenceBitwiseShift,
        seq(
          field('Left', $.expression),
          field('Operation', $.BitwiseShiftOp),
          field('Right', $.expression),
        ),
      ),

    // Bitwise conjunction precedence: &
    BitwiseAnd: (_) => '&',

    BitwiseExpressionAnd: ($) =>
      prec.left(
        P.precedenceBitwiseAnd,
        seq(
          field('Left', $.expression),
          field('Operation', $.BitwiseAnd),
          field('Right', $.expression),
        ),
      ),

    // Bitwise exclusive disjunction precedence: ^
    BitwiseXor: (_) => '^',

    BitwiseExpressionXor: ($) =>
      prec.left(
        P.precedenceBitwiseXor,
        seq(
          field('Left', $.expression),
          field('Operation', $.BitwiseXor),
          field('Right', $.expression),
        ),
      ),

    // Bitwise disjunction precedence: |
    BitwiseOr: (_) => '|',

    BitwiseExpressionOr: ($) =>
      prec.left(
        P.precedenceBitwiseOr,
        seq(
          field('Left', $.expression),
          field('Operation', $.BitwiseOr),
          field('Right', $.expression),
        ),
      ),

    // Nil-Coalescing precedence: ??  right associative!
    NilCoalescingExpression: ($) =>
      prec.right(
        P.precedenceNilCoalescing,
        seq(
          field('Left', $.expression),
          field('Operation', $.NilCoalescing),
          field('Right', $.expression),
        ),
      ),

    // Relational precedence: <, <=, >, >=
    Less: (_) => '<',
    Greater: (_) => '>',
    LessEqual: (_) => '<=',
    GreaterEqual: (_) => '>=',

    RelationalOP: ($) => choice($.Less, $.Greater, $.LessEqual, $.GreaterEqual),

    BinaryExpressionRelational: ($) =>
      prec(
        P.precedenceComparison,
        seq(
          field('Left', $.expression),
          field('Operation', $.RelationalOP),
          field('Right', $.expression),
        ),
      ),

    // Equality precedence: ==, !=
    Equal: (_) => '==',
    Unequal: (_) => '!=',

    EqualityOp: ($) => choice($.Equal, $.Unequal),

    BinaryExpressionEquality: ($) =>
      prec.left(
        P.precedenceComparisonEqual,
        seq(
          field('Left', $.expression),
          field('Operation', $.EqualityOp),
          field('Right', $.expression),
        ),
      ),

    // Logical conjunction precedence: &&
    LogicalAnd: (_) => '&&',

    BinaryExpressionAnd: ($) =>
      prec.left(
        P.precedenceLogicalAnd,
        seq(
          field('Left', $.expression),
          field('Operation', $.LogicalAnd),
          field('Right', $.expression),
        ),
      ),

    // Logical disjunction precedence: ||
    LogicalOr: (_) => '||',

    BinaryExpressionOr: ($) =>
      prec.left(
        P.precedenceLogicalOr,
        seq(
          field('Left', $.expression),
          field('Operation', $.LogicalOr),
          field('Right', $.expression),
        ),
      ),

    // Ternary precedence: ? :*/
    ConditionalExpression: ($) =>
      prec.right(
        P.precedenceTernary,
        seq(
          field('Test', $.expression),
          '?',
          field('Then', $.expression),
          ':',
          field('Else', $.expression),
        ),
      ),

    IdentifierExpression: ($) =>
      prec.left(P.precedenceLiteral, field('Identifier', choice($.Identifier))),

    StringExpression: ($) =>
      prec.left(P.precedenceLiteral, seq(field('Value', $.StringLiteral))),

    BooleanLiteral: ($) => choice($.True, $.False),

    BooleanExpression: ($) =>
      prec(P.precedenceLiteral, seq(field('Value', $.BooleanLiteral))),

    NilLiteral: (_) => 'nil',

    NilExpression: ($) =>
      prec(P.precedenceLiteral, seq(field('Value', $.NilLiteral))),

    _PathSeparator: (_) => '/',
    _PathSeparator_Immediate: (_) => '/',

    PathExpression: ($) =>
      prec(
        P.precedenceLiteral,
        seq(
          $._PathSeparator,
          field('Domain', $.Identifier),
          $._PathSeparator_Immediate,
          field('Identifier', $.Identifier),
        ),
      ),

    FixedPointLiteral: ($) =>
      seq(optional($.Minus), $._positiveFixedPointLiteral),

    FixedPointExpression: ($) =>
      prec(P.precedenceLiteral, seq(field('Value', $.FixedPointLiteral))),

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
          field('Value', $.IntegerLiteral),
          field('Value', $.HexadecimalLiteral),
        ),
      ),

    ArrayExpression: ($) =>
      prec(
        P.precedenceLiteral,
        seq('[', field('Values', commaSep($.expression)), ']'),
      ),

    DictionaryExpression: ($) =>
      prec(
        P.precedenceLiteral,
        seq('{', commaSep($.dictionaryEntry), '}'),
      ),

    dictionaryEntry: ($) => seq($.expression, ':', $.expression),

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

    Auth: (_) => 'auth',
    _ReferenceAnnotation: (_) => '&',

    _Negate: (_) => '!',

    NilCoalescing: (_) => '??',

    Casting: (_) => 'as',
    FailableCasting: (_) => 'as?',
    ForceCasting: (_) => 'as!',

    Argument: ($) =>
      seq(
        optional(seq(field('Label', $.Identifier), ':')),
        field('Expression', $.expression),
      ),

    _If: (_) => 'if',
    _Else: (_) => 'else',
    True: (_) => 'true',
    False: (_) => 'false',
    _Destroy: (_) => 'destroy ',

    SwitchCase: ($) =>
      seq(
        choice(
          seq('case', field('Expression', $.expression)),
          field('Expression', 'default'),
        ),
        ':',
        field('Statements', optional($._Statements)),
      ),

    SwitchStatement: ($) =>
      seq(
        'switch',
        field('Expression', $.expression),
        '{',
        field('Cases', repeat($.SwitchCase)),
        '}',
      ),
  },
});
