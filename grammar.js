function commaSep1(rule) {
    return seq(rule, repeat(seq(',', rule)));
}

function commaSep(rule) {
    return optional(commaSep1(rule));
}


module.exports = grammar({
    name: 'CADENCE',

    extras: $ => [
        $.comment,
        /[\s\p{Zs}\uFEFF\u2060\u200B]/,
    ],

    rules: {

        program: $ => $.declarations,

        WS: $ => /[ \t\u000B\u000C\u0000]+/,
        eos: $ => choice("\n", "\r", ";"),

        terminator:$ => /[\r\n\u2028\u2029]+/,
        blockComment:$ => seq('/*', repeat(/./), '*/'),
        lineComment:$ =>  seq('//', repeat(/./)) ,

        PositiveFixedPointLiteral: $ => /[0-9] ( [0-9_]* [0-9] )? '.' [0-9] ( [0-9_]* [0-9] )?/,
        DecimalLiteral: $ => seq(/[0-9]/, /[0-9_]*/),
        BinaryLiteral: $ => seq(/'0b'/, /[01_]+/),
        OctalLiteral: $ => seq(/'0o'/, /[0-7_]+/),

        _escapedCharacter: $ => choice(seq('\\', /[0\tnr\"\']/), seq('\\u', '{', repeat1($._hexadecimalDigit), '}')),
        _hexadecimalDigit: $ => /[0-9a-fA-F]/,
        _quotedText: $ => choice($._escapedCharacter, /[^"\n\r\\]/, /\s/,/\//),

        comment: $ => /\/\/\/(.*)?\n/,

        hexadecimalLiteral: $ => seq(/'0x'/, /[0-9a-fA-F_]+/),
        stringLiteral: $ => prec(1000, seq('"', repeat($._quotedText), '"')),

        declarations: $ => repeat1(choice(
            $.declaration,
            $.lineComment,
            $.blockComment,
        )),

        //Identifier
        self: $ => 'self',
        identifier: $ => prec(-1, choice($._identifier, $.self)),

        _identifier: $ => seq(
            $._identifierHead,
            repeat($._identifierCharacter)
        ),

        _identifierHead: $ => choice(
            /[a-zA-Z]/,
            '_'
        ),

        _identifierCharacter: $ => token.immediate(choice(
            /[0-9a-zA-Z]/,
            '_'
        )),

        //access
        access: $ => prec(1, choice(
            'priv',
            seq(
                'pub',
                optional(
                    seq('(', 'set', ')')
                ),
            ),
            seq(
                'access', '(', choice('self', 'contract', 'account', 'all'), ')'
            )
        )),

        //type
        // @bluesign: this one cannot contain @ prefix.
        type: $ => prec.left(seq(
            field("reference", optional(
                seq(
                    field("authModifier", optional('auth')),
                    '&',
                )
            )),
            field("innerType", $.innerType),
            field("optional", optional('?')),
        )),

        //type annotation
        typeAnnotation: $ => seq(
            field("isResource", optional('@')),
            field("type", $.type)
        ),

        variableKind: $ => choice(
            'let',
            'var'
        ),

        Assign: $ => '=',
        Move: $ => '<-',
        MoveForced: $ => '<-!',

        transfer: $ => choice(
            $.Assign,
            $.Move,
            $.MoveForced
        ),

        //variable declaration
        variableDeclaration: $ => prec.left(seq(
            field("access", optional($.access)),
            field("kind", $.variableKind),
            field("identifier", $.identifier),
            field("typeAnnotation", optional(seq(':', $.typeAnnotation))),
            field("transfer", $.transfer),
            field("expression", $.expression),
            optional(
                seq(
                    //@bluesign: used in resource move only
                    field("secondTransfer", $.transfer),
                    field("secondValue", $.expression)
                )
            )
        )),

        typeParameter: $=> seq(
            $.identifier, ':', $.typeAnnotation
        ),

        //prec:1000
        typeParameterList: $ => prec(1000, seq(
            '<', commaSep1($.typeParameter), ">"
        )),

        parameter: $ => seq(
            field("label", optional( $.identifier)),
            field("identifier", $.identifier),
            ':',
            field("typeAnnotation", $.typeAnnotation)
        ),

        parameterList: $ => seq(
            '(',
            optional(
                seq(
                    commaSep1($.parameter),
                    //@bluesign: trailing comma is valid in parameter list
                    optional(',')
                )
            ),
            ')'
        ),

        functionDeclaration: $ => prec.left( seq(
            field("access", $.access),
            'fun',
            field("identifier", $.identifier),
            field("typeParameterList", optional($.typeParameterList)),
            field("parameterList", $.parameterList),
            field("returnTypeAnnotation", optional(
                seq( ':', $.typeAnnotation )
            )),
            field("functionBlock", optional($.functionBlock))
        )),


        stringLocation: $ => $.stringLiteral,
        addressLocation: $=> field("address", $.hexadecimalLiteral),

        importDeclaration: $ => seq(
            'import',
            field("identifiers", optional(
                seq(
                    commaSep1($.identifier),
                    'from',
                )
            )),
            field("location", choice(
                $.stringLocation,
                $.hexadecimalLiteral,
                $.identifier
            ))
        ),

        compositeKind: $ => choice(
            'struct',
            'resource',
            'contract',
        ),

        conformance: $ => field("nominalType", $.nominalType),
        conformances: $ =>
            seq(
                ':', commaSep1($.conformance)
            ),

        compositeDeclaration: $ => seq(
            field("access", $.access),
            field("kind", $.compositeKind),
            field("identifier", $.identifier),
            field("conformances", optional($.conformances)),
            '{',
                field("members", optional($.membersAndNestedDeclarations)),
            '}'
        ),

        interfaceDeclaration: $ => seq(
            field("access", $.access),
            field("kind", $.compositeKind),
            'interface',
            field("identifier", $.identifier),
            '{',
                field("members", optional($.membersAndNestedDeclarations)),
            '}'
        ),

        eventDeclaration: $ => seq(
            field("access", $.access),
            'event',
            field("identifier", $.identifier),
            field("parameterList", $.parameterList)
        ),

        prepare: $ => $.specialFunctionDeclaration,
        execute: $ => seq($.identifier, $.block),

        specialFunctionDeclaration: $ => seq(
            $.identifier, $.parameterList,
            optional($.functionBlock)
        ),

        transactionDeclaration: $ => seq(
            'transaction',
            field("parameterList", optional($.parameterList)),
            '{',
                field("fields", optional($.fields)),
                field("prepare", optional($.prepare)),
                field("preConditions", optional($.preConditions)),
                optional(
                    choice(
                        field("execute", $.execute),
                        seq(
                            field("execute", $.execute),
                            field("postConditions", $.postConditions)
                        ),
                        $.postConditions,
                        seq(
                            field("postConditions", $.postConditions),
                            field("execute", $.execute)
                        )
                    )
                ),
            '}'
        ),

        pragmaDeclaration: $ => seq(
            '#', $.expression
        ),

        declaration: $ => choice(
            $.comment,
            $.variableDeclaration,
            $.functionDeclaration,
            $.importDeclaration,
            $.compositeDeclaration,
            $.interfaceDeclaration,
            $.eventDeclaration,
            $.transactionDeclaration,
            $.pragmaDeclaration,
            ";",
        ),


        field: $ => seq(
            field("access", $.access),
            field("kind", optional($.variableKind)),
            field("identifier", $.identifier),
            ':', field("typeAnnotation", $.typeAnnotation)
        ),

        fields: $ => prec.right(repeat1(seq($.field, optional(';')))),

        membersAndNestedDeclarations: $ => repeat1($._memberOrNestedDeclaration),
        _memberOrNestedDeclaration: $ => choice(
            $.field,
            $.specialFunctionDeclaration,
            $.functionDeclaration,
            $.interfaceDeclaration,
            $.compositeDeclaration,
            $.eventDeclaration,
            $.pragmaDeclaration,
        ),


        innerType: $ => prec.left(choice(
            field("typeRestrictions", $.typeRestrictions),
            seq(
                field("baseType", $.baseType),
                field("typeRestrictions", optional($.typeRestrictions))
            )
        )),

        baseType: $ => choice(
            $.nominalType,
            $.functionType,
            $.variableSizedType,
            $.constantSizedType,
            $.dictionaryType,
        ),

        typeRestrictions: $ => seq(
            '{',
            optional($.nominalType),
            repeat(seq(
                ',',
                $.nominalType
            )),
            '}'
        ),

        nominalType: $ => prec.right(seq(
            field("identifier", seq(
                $.identifier,
                optional(
                    repeat(
                        seq(
                            '.',
                            $.identifier
                        )
                    )
                )
            )),

            field("restrictions", optional(
                seq(
                    $.Less,
                    commaSep1($.typeAnnotation),
                    $.Greater
                )
            ))
        )),


        functionType: $ => seq(
            '(',
                '(',
                    commaSep1($.typeAnnotation),
                ')',
                ':',
                $.typeAnnotation,
            ')'
        ),

        variableSizedType: $ => seq(
            '[',
                $.type,
            ']'
        ),

        constantSizedType: $ => seq(
            '[', $.type, ';', $.integerLiteral, ']'
        ),

        dictionaryType: $ => seq(
            '{', $.type, ':', $.type, '}'
        ),

        block: $ => seq(
            '{',
                $.statements,
            '}'
        ),

        functionBlock: $ => seq(
            '{',
                optional($.preConditions),
                optional($.postConditions),
                optional($.statements),
            '}'
        ),

        preConditions: $ => seq(
            'pre',
            '{',
                $.conditions,
            '}'
        ),


        postConditions: $ => seq(
            'post',
            '{',
                $.conditions,
            '}'
        ),


        conditions: $ => repeat1(seq(
                $.condition,
                $.eos
            )
        ),

        condition: $ => seq(
            $.expression,
            optional(
                seq(
                    ':', $.expression
                )
            )
        ),

        statements: $ => repeat1(
            seq(
                $.statement,
                optional($.eos)
            )
        ),

        statement: $ => choice(
            $.switchStatement,
            $.returnStatement,
            $.breakStatement,
            $.continueStatement,
            $.ifStatement,
            $.whileStatement,
            $.forStatement,
            $.emitStatement,
            $.declaration,
            $.assignment,
            $.swap,
            $.expression
        ),

        returnStatement: $ => prec.left( seq(
            'return',
            field("value",optional($.expression))
        )),

        breakStatement: $ => 'break',

        continueStatement: $ => 'continue',

        ifStatement: $ => seq(
            'if',
                choice($.expression, $.variableDeclaration),
                $.block,
            optional(seq('else', choice($.ifStatement, $.block)))
        ),

        whileStatement: $ => seq(
            'while',
            $.expression,
            $.block
        ),

        forStatement: $ => seq(
            'for',
            $.identifier,
            'in',
            $.expression,
            $.block
        ),

        emitStatement: $ => seq(
            'emit',
            $.identifier,
            $.invocation
        ),


        assignment: $ => prec.left(100, seq(
            $.expression,
            $.transfer,
            $.expression
        )),

        swap: $ => prec(100, seq(
            $.expression,
            '<->',
            $.expression
        )),


        identifierExpression: $=> prec(-1,
            field("identifier",
                choice(
                    $.identifier,
                    $.nilLiteral,
                    $.booleanLiteral,
                )
            )
        ),

        createExpression: $ => prec(2, seq(
            'create',
            $.nominalType,
            $.invocation
        )),

        destroyExpression: $ => prec(3, seq(
            'destroy',
            $.expression
        )),

        memberAccess: $ => prec(4,seq(
            $.identifier,
            optional($.Optional),
            '.',
            $.identifier
        )),

        referenceExpression: $ => prec(5, seq(
            '&',
            $.expression,
            'as',
            $.type
        )),

        conditionalExpression: $ => prec(6, prec.left(
            seq(
                '?',
                $.expression,
                ':',
                $.expression
            )
        )),

        bracketExpression: $ => prec(7,
            seq(
                $.expression,
                '[',
                $.expression,
                ']'
             )
        ),

        invokeExpression: $ => prec.left(8, seq(
            $.expression,
            $.invocation,
        )),

        invokeExpressionWithType: $ => prec.left(1000, seq(
            $.identifierExpression,
            $.invocationWithType,
        )),

        forceExpression: $ => prec(9,
            seq(
                $.Negate,
                field("expression", $.expression)
            )
        ),

        negateExpression: $ => prec(10,
            seq(
                $.Negate,
                field("expression", $.expression)
            )
        ),

        moveExpression: $ => prec(10,
            seq(
                $.Move,
                field("expression", $.expression)
            )
        ),

        literalExpression: $ => prec(11,
                $.literal,

        ),

        multiplicativeExpression: $ => prec(12,
            prec.left(seq($.expression, $.multiplicativeOp, $.expression))
        ),

        additiveExpression: $ => prec(13,
            prec.left(seq($.expression, $.additiveOp, $.expression))
        ),


        bitwiseShiftExpression: $ => prec(14,
            prec.left(seq($.expression, $.bitwiseShiftOp, $.expression))
        ),

        bitwiseAndExpression: $ => prec.left(15,
            seq($.expression, '&', $.expression)
        ),

        bitwiseXorExpression: $ => prec(16,
            prec.left(seq($.expression, '^', $.expression))
        ),

        bitwiseOrExpression: $ => prec(17,
            prec.left(seq($.expression, '|', $.expression))
        ),


        nilCoalescingExpression: $ => prec.left(18,
            seq($.expression, seq($.NilCoalescing, $.expression))
        ),

        equalityExpression: $ => prec(19,
            prec.left(seq($.expression, $.equalityOp, $.expression))
        ),

        relationalExpression: $ => prec.left(20,
            seq($.expression, $.relationalOp, $.expression)
        ),

        andExpression: $ => prec.left(21,
           seq($.expression, '&&', $.expression)
        ),

        orExpression: $ => prec(22,
            prec.left(seq($.expression, '||', $.expression))
        ),

        castingExpression: $ => prec(13,
            prec.left(seq(
                field("left", $.expression),
                field("castingOp", $.castingOp),
                field("typeAnnotation", $.typeAnnotation),
            ))
        ),


        expression: $ => prec(90, choice(
            $.identifierExpression,
            $.literalExpression,
            $.createExpression,
            $.destroyExpression,
            //$functionExpression
            $.memberAccess,
            $.referenceExpression,
            $.conditionalExpression,
            //$.pathExpression,
            $.bracketExpression, //array & dictionary
            $.invokeExpression,
            $.invokeExpressionWithType,
            //nested and void
            $.forceExpression,
            $.moveExpression,
            $.negateExpression,


            $.multiplicativeExpression,
            $.additiveExpression,

            $.bitwiseShiftExpression,
            $.bitwiseAndExpression,
            $.bitwiseXorExpression,
            $.bitwiseOrExpression,

            $.nilCoalescingExpression,
            $.equalityExpression,
            $.relationalExpression,

            $.andExpression,
            $.orExpression,

            $.castingExpression,

        )),



        equalityOp: $ => choice(
            $.Equal,
            $.Unequal
        ),

        Equal: $ => '==',
        Unequal: $ => '!=',

        relationalOp: $ => prec(1000, choice(
            $.Less,
            $.Greater,
            $.LessEqual,
            $.GreaterEqual,
        )),

        Less: $ => '<',
        Greater: $ => '>',
        LessEqual: $ => '<=',
        GreaterEqual: $ => '>=',

        bitwiseShiftOp: $ => choice(
            $.ShiftLeft,
            $.ShiftRight
        ),

        ShiftLeft: $ => '<<',
        ShiftRight: $ => '>>',

        additiveOp: $ => choice(
            $.Plus,
            $.Minus
        ),

        Plus: $ => '+',
        Minus: $ => '-',

        multiplicativeOp: $ => choice(
            $.Mul,
            $.Div,
            $.Mod,
        ),

        Mul: $ => '*',
        Div: $ => '/',
        Mod: $ => '%',

        Auth: $ => 'auth',
        Ampersand: $ => '&',



        Negate: $ => '!',

        Optional: $ => '?',

        NilCoalescing: $ => '??',

        Casting: $ => 'as',
        FailableCasting: $ => 'as?',
        ForceCasting: $ => 'as!',

        ResourceAnnotation: $ => '@',

        castingOp: $ => choice(
            $.Casting,
            $.FailableCasting,
            $.ForceCasting,
        ),


        invocationWithType: $ => seq(
            $.Less,
            field("TypeHint",commaSep1($.typeAnnotation)),
            $.Greater
            ,
            '(',
            optional(
                field("arguments", seq(
                    $.argument,
                    repeat(seq(
                        ',',
                        $.argument
                    ))))
            ),
            ')'
        ),

        invocation: $ => seq(
            '(',
            optional(
                field("arguments", seq(
                    $.argument,
                    repeat(seq(
                        ',',
                        $.argument
                    ))))
            ),
            ')'
        ),

        argument: $ => seq(
            optional(seq(
                $.identifier,
                ':')
            ),
            $.expression
        ),

        literal: $ => choice(
            $.fixedPointLiteral,
            $.integerLiteral,
            $.booleanLiteral,
            $.arrayLiteral,
            $.dictionaryLiteral,
            $.stringLiteral,
            $.nilLiteral,
            $.pathLiteral
        ),

        booleanLiteral: $ => choice(
            $.True,
            $.False
        ),

        nilLiteral: $ => 'nil',

        pathLiteral: $ => seq(
            '/',
            $.identifier,
            token.immediate('/'),
            $.identifier
        ),

//nstringLiteral: $=> $.StringLiteral,

        fixedPointLiteral: $ => seq(
            optional($.Minus),
            $.PositiveFixedPointLiteral
        ),

        integerLiteral: $ => seq(
            optional($.Minus),
            $.positiveIntegerLiteral
        ),

        positiveIntegerLiteral: $ => choice(
            $.DecimalLiteral,
            $.BinaryLiteral,
            $.OctalLiteral,
            $.hexadecimalLiteral,
        ),

        arrayLiteral: $ => seq(
            '[',
            optional(seq(
                $.expression,
                repeat(seq(
                    ',',
                    $.expression
                ))
            )),
            ']'
        ),

        dictionaryLiteral: $ => seq(
            '{',
            optional(seq(
                $.dictionaryEntry,
                repeat(seq(
                    ',',
                    $.dictionaryEntry
                )))),
            '}'
        ),

        dictionaryEntry: $ => seq(
            $.expression,
            ':',
            $.expression
        ),

        OpenParen: $ => '(',
        CloseParen: $ => ')',


        Struct: $ => 'struct',
        Resource: $ => 'resource',
        Contract: $ => 'contract',

        Interface: $ => 'interface',

        Fun: $ => 'fun',

        Event: $ => 'event',
        Emit: $ => 'emit',

        Pre: $ => 'pre',
        Post: $ => 'post',

        Priv: $ => 'priv',
        Pub: $ => 'pub',
        Set: $ => 'set',

        Access: $ => 'access',
        All: $ => 'all',
        Account: $ => 'account',

        Return: $ => 'return',

        Break: $ => 'break',
        Continue: $ => 'continue',

        Let: $ => 'let',
        Var: $ => 'var',

        If: $ => 'if',
        Else: $ => 'else',

        While: $ => 'while',

        For: $ => 'for',
        In: $ => 'in',

        True: $ => 'true',
        False: $ => 'false',

        Nil: $ => 'nil',

        Import: $ => 'import',
        From: $ => 'from',

        Create: $ => 'create',
        Destroy: $ => 'destroy',







    switchCase
:
$ => seq(
    choice(
        seq("case", $.expression),
        "default"
    ),
    ":",
    optional($.statements)
),


    switchStatement
:
$ => seq(
    "switch",
    field("expression", $.expression),
    "{",
    field("cases", repeat($.switchCase)),
    "}"
),





}


})
;
		         
