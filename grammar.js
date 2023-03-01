function commaSep1(rule) {
    return seq(rule, repeat(seq(',', rule)));
}

function commaSep(rule) {
    return optional(commaSep1(rule));
}


module.exports = grammar({
    name: 'CADENCE',

    extras: $ => [
        //$.stringLiteral,
        //$.lineComment,
        /[\s\uFEFF\u2060\u200B]/, //TODO:@bluesign check me
    ],
    word: $=>$._identifier,
    supertypes: $=>[$.expression, $.declaration],
    conflicts: $ => [
        [$.invokeExpression, $.bitwiseAndExpression, $.relationalExpression],
        [$.invokeExpression, $.bitwiseXorExpression, $.relationalExpression],
        [$.invokeExpression, $.bitwiseOrExpression, $.relationalExpression],
        [$.invokeExpression, $.nilCoalescingExpression, $.relationalExpression],
        [$.invokeExpression, $.bitwiseShiftExpression, $.relationalExpression],
        [$.invokeExpression, $.additiveExpression, $.relationalExpression],
        [$.invokeExpression, $.multiplicativeExpression, $.relationalExpression],

        [$.orExpression, $.conditionalExpression],
        [$.relationalExpression],
        [$.relationalExpression, $.equalityExpression],
        [$.relationalOp, $.invocation],
        [$.typeAnnotation],
        [$.type],
        [$.dictionaryType, $.typeRestrictions],

        [$._TypeHintOpen, $.Less]
    ],
    rules: {

        program: $ => $.declarations,

        _eos: _ => choice("\n", "\r", ";"),

        blockComment: _ => seq('/*', repeat(/./), '*/'),
        lineComment: $ =>  prec(-1, seq(
            '//', /.*/, $._eos
        )),

        _positiveFixedPointLiteral: _ => /[0-9]([0-9_]*[0-9])\.[0-9]([0-9_]*[0-9])?/,
        _decimalLiteral: _ => seq(/[0-9]/, /[0-9_]*/),
        _binaryLiteral: _ => seq(/'0b'/, /[01_]+/),
        _octalLiteral: _ => seq(/'0o'/, /[0-7_]+/),

        _escapedCharacter: $ => choice(seq('\\', /[0\tnr"']/), seq('\\u', '{', repeat1($._hexadecimalDigit), '}')),
        _hexadecimalDigit: _ => /[0-9a-fA-F]/,
        _quotedText: $ => choice($._escapedCharacter, /[^"\n\r\\]/, /\s/,/\//),

        _hexadecimalLiteral: _ => seq(/'0x'/, /[0-9a-fA-F_]+/),
        stringLiteral: $ =>  seq('"', repeat($._quotedText), token.immediate('"')),

        declarations: $ => repeat1(choice(
            $.lineComment,
            $.declaration,
        )),

        //Identifier
        _identifier: $ => /[a-zA-Z_]([0-9a-zA-Z]*)?/,
        identifier: $ => $._identifier,

        //access
        access: $ => prec(1, choice(
            'priv',
            seq(
                'pub',
                optional(
                    seq($._OpenParen, 'set', $._CloseParen)
                ),
            ),
            seq(
                'access', $._OpenParen, choice('self', 'contract', 'account', 'all'), $._CloseParen
            )
        )),

        //type
        // @bluesign: this one cannot contain @ prefix.
        type: $ =>seq(
            field("reference", optional(
                seq(
                    field("authModifier", optional('auth')),
                    field("reference",$.ReferenceAnnotation),
                )
            )),
            choice(
                seq(
                    $.nominalType,
                    field("typeRestrictions", optional($.typeRestrictions)),
                ),
                $.nominalType,
                $.functionType,
                $.variableSizedType,
                $.constantSizedType,
                $.dictionaryType,
                field("typeRestrictions", $.typeRestrictions),
            ),
            field("optional",  optional($._Optional)),
        ),


        //type annotation
        typeAnnotation: $ => prec(1,seq(
            field("isResource", optional($.ResourceAnnotation)),
            field("type", commaSep1($.type))
        )),

        typeRestrictions: $ => seq(
            '{',
            commaSep1($.nominalType),
            '}'
        ),

        variableKind: _ => choice(
            'let',
            'var'
        ),

        Assign: _ => '=',
        Move: _ => '<-',
        MoveForced: _ => '<-!',

        transfer: $ => choice(
            field("method", $.Assign),
            field("method",$.Move),
            field("method",$.MoveForced)
        ),

        //variable declaration
        variableDeclaration: $ => prec.left(seq(
            field("access", optional($.access)),
            field("kind", $.variableKind),
            field("identifier", $.identifier),
            field("typeAnnotation", optional(seq($._SemiColon, $.typeAnnotation))),
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
            $._identifier, $._SemiColon, $.typeAnnotation
        ),

        //prec:1000
        typeParameterList: $ => prec(1000, seq(
            $._TypeHintOpen, commaSep1($.typeParameter), $._TypeHintClose
        )),

        parameter: $ => seq(
            field("label", optional( $.identifier)),
            field("identifier", $.identifier),
            $._SemiColon,
            field("typeAnnotation", $.typeAnnotation)
        ),

        parameterList: $ => seq(
            $._OpenParen,
            optional(
                seq(
                    commaSep1($.parameter),
                    //@bluesign: trailing comma is valid in parameter list
                    optional(',')
                )
            ),
            $._CloseParen
        ),

        functionDeclaration: $ => prec.left( seq(
            field("access", $.access),
            $._Fun,
            field("identifier", $.identifier),
            field("typeParameterList", optional($.typeParameterList)),
            field("parameterList", $.parameterList),
            field("returnTypeAnnotation", optional(
                seq($._SemiColon, $.typeAnnotation )
            )),
            field("functionBlock", optional($.functionBlock))
        )),


        stringLocation: $ => $.stringLiteral,
        addressLocation: $=> field("address", $._hexadecimalLiteral),


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
                $.addressLocation,
                $._identifier
            ))
        ),

        compositeKind: _ => choice(
            'struct',
            'resource',
            'contract',
        ),

        conformance: $ => field("nominalType", $.nominalType),
        conformances: $ =>
            seq(
                $._SemiColon, commaSep1($.conformance)
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
            field("name",$.identifier),
            field("parameterList", $.parameterList),
            field("functionBlock", optional($.functionBlock))
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
            $.variableDeclaration,
            $.functionDeclaration,
            $.importDeclaration,
            $.compositeDeclaration,
            $.interfaceDeclaration,
            $.eventDeclaration,
            $.transactionDeclaration,
            $.pragmaDeclaration,
        ),


        field: $ => seq(
            field("access", $.access),
            field("kind", optional($.variableKind)),
            field("identifier", $.identifier),
            $._SemiColon, field("typeAnnotation", $.typeAnnotation)
        ),

        fields: $ => prec.right(repeat1(seq($.field, optional(';')))),

        membersAndNestedDeclarations: $ => repeat1($._memberOrNestedDeclaration),
        _memberOrNestedDeclaration: $ => choice(
            $.lineComment,

            $.field,
            $.specialFunctionDeclaration,
            $.functionDeclaration,
            $.interfaceDeclaration,
            $.compositeDeclaration,
            $.eventDeclaration,
            $.pragmaDeclaration,
        ),







        nominalType: $ => prec.right(seq(
            field("identifier", seq(
                $._identifier,
                optional(
                    repeat(
                        seq(
                            '.',
                            $._identifier
                        )
                    )
                )
            )),
        )),


        functionType: $ => seq(
            $._OpenParen,
                optional($._Fun), //TODO: @bluesign check this
            $._OpenParen,
                    commaSep1($.typeAnnotation),
            $._CloseParen,
                $._SemiColon,
                $.typeAnnotation,
            $._CloseParen
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
            '{',
            field("keyType", $.type),
            $._SemiColon,
            field("valueType", $.type),
            '}'
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
                $._eos
            )
        ),

        condition: $ => seq(
            $.expression,
            optional(
                seq(
                    $._SemiColon, $.expression
                )
            )
        ),

        statements: $ => repeat1(
            choice(
            seq(
                $.statement,
                optional($.lineComment),
                optional($._eos),
            ),
            $.lineComment,
            seq(
                optional($.lineComment),
                $.statement,
                optional($._eos),
            ))
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

        returnStatement: $ => prec.right( seq(
            'return',
            field("value",optional($.expression))
        )),

        breakStatement: _ => 'break',

        continueStatement: _ => 'continue',

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
            field("identifier", $.identifier),
            'in',
            field("expression", $.expression),
            field("block", $.block)
        ),

        emitStatement: $ => seq(
            'emit',
            field("eventName", $.identifier),
            field("invocation",$.invocation)
        ),


        assignment: $ => prec.left(100, seq(
            field("left",$.expression),
            field("transfer",$.transfer),
            field("right",$.expression)
        )),

        swap: $ => prec(100, seq(
            $.expression,
            '<->',
            $.expression
        )),



        identifierExpression: $=> prec(1,
            field("identifier",
                choice(
                    $.identifier,
                    $.nilLiteral,
                    $.booleanLiteral,
                )
            )
        ),

        createExpression: $ => prec(1090, seq(
            $._Create,
            $.nominalType,
            $.invocation
        )),

        destroyExpression: $ => prec(1080, seq(
            'destroy',
            $.expression
        )),

        functionExpression: $ => prec(1070, seq(
            $._OpenParen,
            optional($._Fun),
            field("parameterList", $.parameterList),
            field("returnTypeAnnotation", optional(seq(
                $._SemiColon,
                $.typeAnnotation,
            ))),
            $.functionBlock,
            $._CloseParen,
        )),



        nestedExpression: $ => prec(1060,
            seq(
                $._OpenParen,
                field("expression", $.expression),
                $._CloseParen
            )
        ),

        literalExpression: $ => prec(1,
            $.literal,
        ),






        //exprLeftBindingPowerAccess

        memberAccessExpression: $ => prec(1000,seq(
            field("target", $.expression),
            optional($._Optional),
            '.',
            field("member", $.identifier)
        )),

        bracketExpression: $ => prec.left(1001,
            seq(
                $.expression,
                '[',
                $.expression,
                ']'
             )
        ),

        invokeExpression: $ => prec(1002, seq(
            field("target", $.expression),
            field("invocation", $.invocation),
        )),





        //exprLeftBindingPowerUnaryPostfix
        forceExpression: $ => prec.left(990,
            seq(
                field("expression", $.expression),
                $._Negate,
            )
        ),

        //exprLeftBindingPowerUnaryPrefix
        moveExpression: $ => prec.left(2980,
            seq(
                $.Move,
                field("expression", $.expression)
            )
        ),

        negateExpression: $ => prec.left(2980,
            seq(
                $._Negate,
                field("expression", $.expression)
            )
        ),


        //exprLeftBindingPowerCasting
        castingExpression: $ => prec.left(970,
            prec.left(seq(
                field("left", $.expression),
                field("castingOp", $.castingOp),
                field("typeAnnotation", $.typeAnnotation),
            ))
        ),

        referenceExpression: $ => prec.left(970-1, seq(
            $.ReferenceAnnotation,
            $.expression,
            $._Casting,
            $.type
        )),

        //exprLeftBindingPowerMultiplication
        multiplicativeExpression: $ => prec.left(960,
            prec.left(seq($.expression, $.multiplicativeOp, $.expression))
        ),

        //exprLeftBindingPowerAddition
        additiveExpression: $ => prec.left(950,
            prec.left(seq($.expression, $.additiveOp, $.expression))
        ),

        //exprLeftBindingPowerBitwise...

        bitwiseShiftExpression: $ => prec.left(940,
            prec.left(seq($.expression, $.bitwiseShiftOp, $.expression))
        ),

        bitwiseAndExpression: $ => prec.left(930,
            seq($.expression, '&', $.expression)
        ),

        bitwiseXorExpression: $ => prec.left(920,
            prec.left(seq($.expression, '^', $.expression))
        ),

        bitwiseOrExpression: $ => prec.left(910,
            prec.left(seq($.expression, '|', $.expression))
        ),

        //exprLeftBindingPowerNilCoalescing
        nilCoalescingExpression: $ => prec.left(900,
            seq($.expression, seq($.NilCoalescing, $.expression))
        ),

        //exprLeftBindingPowerComparison
        relationalExpression: $ => prec(890,
            seq($.expression, $.relationalOp, $.expression)
        ),

        equalityExpression: $ => prec.left(890,
            prec.left(seq($.expression, $.equalityOp, $.expression))
        ),


        //exprLeftBindingPowerLogical..
        andExpression: $ => prec.left(880,
            seq($.expression, '&&', $.expression)
        ),

        orExpression: $ => prec.left(870,
            prec.left(seq($.expression, '||', $.expression))
        ),

        // exprLeftBindingPowerTernary

        conditionalExpression: $ => prec(870,
            seq(
                '?',
                $.expression,
                $._SemiColon,
                $.expression
            )
        ),


















        expression: $ => prec(90, choice(
            //priority
            $.bracketExpression,
            $.invokeExpression,
            $.memberAccessExpression,


            $.identifierExpression,
            $.literalExpression,
            $.createExpression,
            $.destroyExpression,
            $.functionExpression,

            $.referenceExpression,
            $.conditionalExpression,

            $.nestedExpression,
            $.forceExpression,

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

            $.moveExpression,
            $.negateExpression,


        )),




        equalityOp: $ => choice(
            $.Equal,
            $.Unequal
        ),

        Equal: _ => '==',
        Unequal: _ => '!=',

        relationalOp: $ => prec(1000, choice(
            $.Less,
            $.Greater,
            $.LessEqual,
            $.GreaterEqual,
        )),

        _TypeHintOpen: _ => '<',
        _TypeHintClose: _ => '>',

        Less: _ => '<',
        Greater: _ => '>',
        LessEqual: _ => '<=',
        GreaterEqual: _ => '>=',

        bitwiseShiftOp: $ => choice(
            $.ShiftLeft,
            $.ShiftRight
        ),

        ShiftLeft: _ => '<<',
        ShiftRight: _ => '>>',

        additiveOp: $ => choice(
            $.Plus,
            $.Minus
        ),

        Plus: _ => '+',
        Minus: _ => '-',

        multiplicativeOp: $ => choice(
            $.Mul,
            $.Div,
            $.Mod,
        ),

        Mul: _ => '*',
        Div: _ => '/',
        Mod: _ => '%',

        Auth: _ => 'auth',
        ReferenceAnnotation: _ => '&',



        _Negate: _ => '!',

        _Optional: _ => '?',

        NilCoalescing: _ => '??',

        _Casting: _ => 'as',
        FailableCasting: _ => 'as?',
        ForceCasting: _ => 'as!',

        ResourceAnnotation: _ => '@',

        castingOp: $ => choice(
            $._Casting,
            $.FailableCasting,
            $.ForceCasting,
        ),


        invocation: $ => prec(1000,seq(
            optional(
                seq(
                    $._TypeHintOpen,
                    field("TypeHint",commaSep1($.typeAnnotation)),
                    $._TypeHintClose
                )
            )
            ,
            $._OpenParen, field("arguments", commaSep($.argument)), $._CloseParen
        )),




        argument: $=> seq(
            optional(
                seq(
                    field("label", $.identifier),
                    $._SemiColon,
                )
            ),
            field("value", $.expression)
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

        nilLiteral: _ => 'nil',

        pathLiteral: $ => seq(
            '/',
            field("domain", $.identifier),
            token.immediate('/'),
            field("identifier", $.identifier)
        ),

        fixedPointLiteral: $ => prec(2,seq(
            optional($.Minus),
            $._positiveFixedPointLiteral
        )),

        integerLiteral: $ => prec(1, seq(
            optional($.Minus),
            $._positiveIntegerLiteral
        )),

        _positiveIntegerLiteral: $ => choice(
            $._decimalLiteral,
            $._binaryLiteral,
            $._octalLiteral,
            $._hexadecimalLiteral,
        ),

        arrayLiteral: $ => seq(
            '[', commaSep($.expression), ']'
        ),

        dictionaryLiteral: $ => seq(
            '{', commaSep($.dictionaryEntry), '}'
        ),

        dictionaryEntry: $ => seq(
            $.expression,
            $._SemiColon,
            $.expression
        ),

        _OpenParen: _ => '(',
        _CloseParen: _ => ')',
        _Struct: _ => 'struct ',
        _Resource: _ => 'resource ',
        _Contract: _ => 'contract ',
        _Interface: _ => 'interface ',
        _Fun: _ => 'fun',
        _Event: _ => 'event ',
        _Emit: _ => 'emit ',
        _Pre: _ => 'pre',
        _Post: _ => 'post',
        _Priv: _ => 'priv',
        _Pub: _ => 'pub ',
        _Set: _ => 'set',
        _Access: _ => 'access',
        _All: _ => 'all',
        _Account: _ => 'account',
        _Return: _ => 'return',
        _Break: _ => 'break',
        _Continue: _ => 'continue',
        _Let: _ => 'let ',
        _Var: _ => 'var ',
        _If: _ => 'if',
        _Else: _ => 'else',
        _While: _ => 'while',
        _For: _ => 'for',
        _In: _ => 'in ',
        True: _ => 'true',
        False: _ => 'false',
        _Nil: _ => 'nil',
        _Import: _ => 'import ',
        _From: _ => 'from ',
        _Create: _ => 'create ',
        _Destroy: _ => 'destroy',
        _SemiColon: _ => ':',


    switchCase: $ => seq(
        choice(
            seq("case", $.expression),
            "default"
        ),
        ":",
        optional($.statements)
    ),


    switchStatement: $ => seq(
        "switch",
        field("expression", $.expression),
        "{",
        field("cases", repeat($.switchCase)),
        "}"
    ),





}


})
;
		         
