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
	
		source_file: $ => repeat($.declaration),

		comment: $ => /\/\/(.*)?\n/,
		
		declaration: $ => choice(
			$.compositeDeclaration,
			$.interfaceDeclaration,
    $.functionDeclaration,
    $.variableDeclaration,
    $.importDeclaration,
    $.eventDeclaration,
    $.transactionDeclaration,
    $.pragmaDeclaration,
		),


	transactionDeclaration: $=> seq(
	  'transaction',
      optional($.parameterList),
      '{',
      $.fields,
      optional($.prepare),
      optional($.preConditions),
      optional(
		choice( 
			$.execute,
			seq($.execute, $.postConditions),
			$.postConditions,
			seq($.postConditions, $.execute)  
	    )
	   ),
      '}'
	),

	prepare: $=> $.specialFunctionDeclaration,
	execute: $=> seq($.identifier, $.block),

	importDeclaration: $=> seq(
		'import',
		optional(
			seq(
					$.identifier,
					repeat(
							seq(
							',',
							$.identifier
						)
					),
				'from',
			)
		),
		choice(
						$.stringLiteral,
						$.HexadecimalLiteral,
						$.identifier
		)
			
		
	)
	,
		


	access: $=> prec(1, choice(
		'priv',
		seq(
			'pub',
			optional(seq(
				'(',
				'set',
				')'
			)),
		),
		seq(
			'access',
			'(',
			choice('self','contract','account','all'),
			')'
		)
	)),

	compositeDeclaration: $=> seq(
		$.access,
		$.compositeKind,
		$.identifier,
		optional($.conformances),
		'{',
		optional($.membersAndNestedDeclarations),
		'}'
	),

	conformances: $ => 
	seq(
	':',
		seq(
			$.nominalType,
			repeat(
				seq(
					',',
					$.nominalType,
				)
			)
	)
	),

	variableKind: $=> choice(
		'let',
		'var'
	),

	field: $ => seq(
		$.access,
		optional($.variableKind),
		$.identifier,
		':', 
		$.typeAnnotation
	),

	fields: $ => prec.right(repeat1(seq( $.field, optional(';') ))),

    interfaceDeclaration: $ => seq(
		$.access,
		$.compositeKind,
		'interface',
		$.identifier,
		'{',
		$.membersAndNestedDeclarations,
		'}'
	),

	membersAndNestedDeclarations: $ => repeat1(
		seq(
			$._memberOrNestedDeclaration
		)
	),
    
	_memberOrNestedDeclaration: $ => choice(
		$.field,
		$.specialFunctionDeclaration,
		$.functionDeclaration,
		$.interfaceDeclaration,
		$.compositeDeclaration,
		$.eventDeclaration,
		$.pragmaDeclaration,
	),

	compositeKind : $=> choice(
		'struct',
		'resource',
		'contract',
	),

	specialFunctionDeclaration: $=> seq(
		$.identifier,
		$.parameterList,
		optional($.functionBlock)
	),
    
	functionDeclaration: $=> seq(
		$.access,
		'fun',
		$.identifier,
		$.parameterList,
		optional(
			seq( 
				':', 
				$.typeAnnotation 
			)
		),
		optional($.functionBlock)
	),
    
	eventDeclaration: $=> seq(
		$.access,
		'event',
		$.identifier,
		$.parameterList
	),
    

	pragmaDeclaration: $=> seq(
		'#',
		$.expression
	),

	parameterList: $=>seq(
		'(',
		optional(
			seq(
				$.parameter,
				repeat(
					seq(
						",",
						$.parameter
					)
				)
			)
		),
		 ')'
	),
	
	parameter: $=> seq(
		optional($.identifier),
		$.identifier,
		':',
		$.typeAnnotation
	),
	typeAnnotation: $ => seq(
		optional('@'),
		$.fullType
	),
	
	fullType : $ => seq(
		optional(
			seq(
				optional('auth'),
				'&',
			)
		),
		$.innerType,
		optional('?'),
	),
    
	innerType: $ =>  prec.left(choice(
		$.typeRestrictions,
		seq(
			$.baseType,
			optional($.typeRestrictions)
		)
	)),

	baseType: $=> choice(
		$.nominalType,
		$.functionType,
    	$.variableSizedType,
    	$.constantSizedType,
    	$.dictionaryType,
	),

	typeRestrictions: $=> seq(
		'{',
		optional($.nominalType),
		repeat(seq(
			',',
			$.nominalType
		)),
		 '}'
	),

	nominalType: $ => prec.right(seq(
		$.identifier,
		optional( 
			repeat(
				seq(
					'.', 
					$.identifier 
				)
			)
		),
		optional(
			seq(
				'<',
				optional(
					seq(	
						$.typeAnnotation,
						repeat(
							seq(
								',',
								$.typeAnnotation,
							)
						),
					)
				),
				'>'
			)
		)
		)),
	

	functionType: $=> seq(
		'(',
		'(',
		optional(seq(
			$.typeAnnotation,
			optional(seq(
				',',
				$.typeAnnotation
			))
		)),
		')',
		':',
		$.typeAnnotation,
		')'
	),
	
	variableSizedType: $=> seq(
		'[',
		$.fullType,
		']'
	),
	
	constantSizedType: $=> seq(
		'[',
		$.fullType,
		';',
		$.integerLiteral,
		']'
	),
	
	dictionaryType: $=> seq(
		'{',
		$.fullType, 
		':', 
		$.fullType,
		'}'
	),
	
	block: $=> seq(
		'{',
		$.statements,
		'}'
	),

	functionBlock: $=> seq(
		'{',
		optional($.preConditions),
		optional($.postConditions),
		optional($.statements),
		'}'
	),
    

	preConditions: $=> seq(
		'pre',
		'{',
		$.conditions,
		'}'
	),
    
	
	postConditions: $=> seq(
		'post',
		'{',
		$.conditions,
		'}'
	),


conditions: $=> repeat1(seq( 
	$.condition,
	$.eos
	)
),

condition: $=> seq ( 
	$.expression,
	optional(
		seq(
			 ':', 
			 $.expression 
			)
	)
),

  statements: $=> repeat1(seq(
	$.statement,
	$.eos 
  )),
  
  statement: $=> choice(
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

  returnStatement: $=> seq(
	'return',
	optional($.expression)
  ),

  breakStatement: $=> 'break',

  continueStatement: $=> 'continue',

  ifStatement: $=> seq(
	'if',
    choice( $.expression , $.variableDeclaration ),
    $.block,
    optional( seq( 'else' , choice( $.ifStatement , $.block )) ) 
  ),

  whileStatement: $=> seq(
	'while',
	$.expression,
	$.block
  ),

  forStatement: $=> seq(
	'for',
	$.identifier,
	'in', 
	$.expression,
	$.block
  ),

  emitStatement: $=> seq(
    'emit',
	$.identifier,
	$.invocation
  ),

  variableDeclaration: $=> seq(
	optional($.access),
	$.variableKind,
	$.identifier,
	optional( seq(':', $.typeAnnotation) ),
    $.transfer,
	$.expression,
    optional(seq( $.transfer, $.expression ))
  ),

  assignment: $=> seq( 
	$.expression,
	$.transfer,
	$.expression
  ),

  swap: $=> seq(
	$.expression,
	 '<->',
	 $.expression
  ),
  
  transfer: $=> choice(
	'=',
    $.Move,
    $.MoveForced
  ),


expression: $=> choice(
	$.conditionalExpression,
	$.orExpression,
	$.andExpression,
	$.equalityExpression,
	$.relationalExpression,
	$.nilCoalescingExpression,
	$.bitwiseOrExpression,
	$.bitwiseXorExpression,
	$.bitwiseAndExpression,
	$.bitwiseShiftExpression,
	$.additiveExpression,
	$.multiplicativeExpression,
	$.castingExpression,
	$.unaryExpression,
	$.primaryExpression,
	$.postfixExpression

),
  
conditionalExpression:  $=> prec(1, prec.right(
		seq(
			'?',
			$.expression,
			':',
			$.expression 
		)
)),
 
orExpression: $=> prec(2,
	prec.right(seq($.expression, '||', $.expression))
),

andExpression: $=> prec(3,
	prec.right(seq($.expression, '&&', $.expression))
),

equalityExpression: $=> prec(4,
	prec.right(seq($.expression, $.equalityOp, $.expression))
),

relationalExpression: $=> prec(5,
	prec.right(seq($.expression, $.relationalOp, $.expression))
),

nilCoalescingExpression: $=>  prec(6,prec.right(
  seq( $.expression, seq($.NilCoalescing, $.expression ))
)),

bitwiseOrExpression:  $=>  prec(7,
	prec.right(seq($.expression, '|', $.expression))
),

bitwiseXorExpression: $=>  prec(8,
	prec.right(seq($.expression, '^', $.expression))
),

bitwiseAndExpression: $=>  prec(9,
	prec.right(seq($.expression, '&', $.expression))
),

bitwiseShiftExpression: $=>  prec(10,
	prec.right(seq($.expression, $.bitwiseShiftOp, $.expression))
),
 
additiveExpression: $=>  prec(11,
	prec.right(seq($.expression, $.additiveOp, $.expression))
),

multiplicativeExpression: $=>  prec(12,
	prec.right(seq($.expression,$.multiplicativeOp, $.expression))
),

castingExpression: $=>  prec(13,
	prec.right(seq($.expression, $.castingOp, $.expression))
),

unaryExpression: $=>  prec(14,
  seq($.unaryOp)
),

primaryExpression: $=>  prec(15,
	choice(
		$.createExpression,
  		$.destroyExpression,
  		$.referenceExpression,
  )
),

postfixExpression: $=>  prec(15,
	choice(
		$.identifier,
		$.literal,
  		seq('fun', $.parameterList, optional(seq(':', $.typeAnnotation )), $.functionBlock),
  		seq('(', $.expression, ')'),
  		seq($.postfixExpression, $.invocation),
  		seq($.postfixExpression, $.expressionAccess),
  		seq($.postfixExpression , '!')
	)
),

equalityOp: $=> choice(
	$.Equal,
	$.Unequal
),


Equal: $=> '==',
Unequal: $=> '!=', 

relationalOp: $=> choice(
    $.Less,
    $.Greater,
    $.LessEqual,
    $.GreaterEqual,
),

Less: $=> '<', 
Greater: $=> '>' ,
LessEqual: $=> '<=' ,
GreaterEqual: $=> '>=' ,

bitwiseShiftOp: $=> choice(
    $.ShiftLeft,
    $.ShiftRight
),

ShiftLeft: $=> '<<',
ShiftRight: $=> '>>',

additiveOp: $=> choice(
    $.Plus,
    $.Minus
),

Plus: $=> '+',
Minus: $=> '-',

multiplicativeOp: $=> choice(
    $.Mul,
    $.Div,
    $.Mod,
),

Mul: $=> '*',
Div: $=> '/',
Mod: $=> '%',

Auth: $=> 'auth',
Ampersand: $=> '&',

unaryOp: $=> choice(
    $.Minus,
    $.Negate,
    $.Move
),

Negate: $=> '!' ,
Move: $=> '<-' ,
MoveForced: $=> '<-!' ,

Optional: $=> '?',

NilCoalescing: $=>'??',

Casting: $=> 'as',
FailableCasting: $=>'as?',
ForceCasting : $=>'as!',

ResourceAnnotation : $=>'@' ,

castingOp: $=> choice(
    $.Casting,
    $.FailableCasting,
    $.ForceCasting,
),

createExpression: $=> prec(15, seq(
	'create',
	$.nominalType,
	$.invocation
)),
    
destroyExpression: $=> prec(15,seq(
    'destroy',
	$.expression
)),

referenceExpression: $=> prec(15,seq(
    '&',
	$.expression,
	'as',
	$.fullType
)),

expressionAccess: $=> choice(
	$.memberAccess,
	$.bracketExpression
),
   
memberAccess: $=> seq(
    optional($.Optional),
	'.',
	$.identifier
),

bracketExpression: $=> seq(
    '[',
	$.expression,
	']'
),

invocation: $=> seq(
	optional( 
		seq(
			'<',
			optional(
				seq(
					$.typeAnnotation,
					repeat(
						seq(
							",",
							$.typeAnnotation
						)
					)
				)
			),
			'>'
		)
	),
	'(',
	optional(seq(
		$.argument,
		repeat(seq( 
			',',
			$.argument 
		)))),
	')'
),

argument: $=> seq( 
	optional(seq(
		$.identifier,
		  ':' )
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

booleanLiteral: $=>choice(
    $.True,
    $.False
),

nilLiteral: $=> 'nil',

pathLiteral: $=> seq(
	'/' ,
	$.identifier,
    token.immediate('/'),
	$.identifier
),

stringLiteral: $=> $.StringLiteral,
    
fixedPointLiteral: $=> seq(
	optional($.Minus),
	$.PositiveFixedPointLiteral
),

integerLiteral: $ => seq(
	optional($.Minus),
	$.positiveIntegerLiteral
),
 
positiveIntegerLiteral: $=> choice(
    $.DecimalLiteral,
    $.BinaryLiteral,
    $.OctalLiteral,
    $.HexadecimalLiteral,
    $.InvalidNumberLiteral
),

arrayLiteral: $=> seq(
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
	 optional( seq (
		$.dictionaryEntry,
		repeat(seq( 
			',', 
			$.dictionaryEntry  
		)))) ,
	 '}'
),

dictionaryEntry: $=> seq(
    $.expression,
	':',
	$.expression
),

OpenParen: $=> '(' ,
CloseParen: $=> ')' ,

Transaction : $=> 'transaction' ,

Struct : $=> 'struct' ,
Resource : $=> 'resource' ,
Contract : $=> 'contract' ,

Interface : $=> 'interface' ,

Fun : $=> 'fun' ,

Event : $=> 'event' ,
Emit : $=> 'emit' ,

Pre : $=> 'pre' ,
Post : $=> 'post' ,

Priv : $=> 'priv' ,
Pub : $=> 'pub' ,
Set : $=> 'set' ,

Access : $=> 'access' ,
All : $=> 'all' ,
Self : $=> 'self' ,
Account : $=> 'account' ,

Return : $=> 'return' ,

Break : $=> 'break' ,
Continue : $=> 'continue' ,

Let : $=> 'let' ,
Var : $=> 'var' ,

If : $=> 'if' ,
Else : $=> 'else' ,

While : $=> 'while' ,

For : $=> 'for' ,
In : $=> 'in' ,

True : $=> 'true' ,
False : $=> 'false' ,

Nil : $=> 'nil' ,

Import : $=> 'import' ,
From : $=> 'from' ,

Create : $=> 'create' ,
Destroy : $=> 'destroy' ,


PositiveFixedPointLiteral
    : $=>  /[0-9] ( [0-9_]* [0-9] )? '.' [0-9] ( [0-9_]* [0-9] )?/,
    

DecimalLiteral: $=>seq(/[0-9]/,/[0-9_]*/),

BinaryLiteral: $=>seq(/'0b'/,/[01_]+/),

OctalLiteral: $=>seq(/'0o'/,/[0-7_]+/),

HexadecimalLiteral: $=>seq(/'0x'/,/[0-9a-fA-F_]+/),

InvalidNumberLiteral: $=>seq(
	'0',
	/[a-zA-Z]/,
	/[0-9a-zA-Z_]*/
),

  
StringLiteral: $=>seq(
    '"',
	repeat($._QuotedText),
	'"'
),

_QuotedText: $=>choice(
    $.EscapedCharacter,
    /[^"\n\r\\]/,
	/\s/,
),

EscapedCharacter: $=> choice(
    seq( '\\', /[0\tnr\"\']/ ),
    seq('\\u', '{', repeat1($.HexadecimalDigit),  '}')
),

HexadecimalDigit : $=> /[0-9a-fA-F]/,

WS: $=> /[ \t\u000B\u000C\u0000]+/,
    

Terminator: $=> /[\r\n\u2028\u2029]+/,
    

BlockComment: $=> seq('/*', repeat(  /./ ) , '*/'),

LineComment: $=> seq('//', /~[\r\n]*/),
    


	identifier: $ => prec(-1, choice(
		$._Identifier,
		$.Self
		)),


	_Identifier: $ => seq(
    	$._IdentifierHead,
		repeat($._IdentifierCharacter)
	),

	
	_IdentifierHead: $ => choice(
    /[a-zA-Z]/,
    '_'
	),

	_IdentifierCharacter: $=> token.immediate(choice(
    /[0-9a-zA-Z]/,
    '_'
	)),



	

	

	
		
	 


eos: $=>choice(
	"\n",
	"\r",
	";"
),



}
	
	
	
	});
		         
