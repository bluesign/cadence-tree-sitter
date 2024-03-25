import HelloWorld2 from 0x01
// <- keyword
//     ^ type
//                 ^ keyword
//                      ^ number

/// This is a simple HelloWorld contract
// <- comment.doc
access(all)
contract HelloWorld : HelloWorld2 {
// <- keyword
//       ^ type
//                    ^ type

// some comment
// <- comment


    access(all) let greeting: String
    // <- keyword
    //          ^ type.qualifier
    //              ^ variable
    //                        ^ type.builtin

    access(all) resource SomeResource {
    // <- keyword
    //                   ^ type
        access(all) var someField: UFix64
        //              ^ variable
        //                         ^ type.builtin
        access(contract) var someBool: Bool

        init(someField: UFix64) {
        // <- constructor
        //   ^ variable.parameter
        //              ^ type.builtin

            self.someField = someField
            self.someBool = true
            //              ^ boolean
        }
    }

    access(all)
    // <- keyword
    fun hello(someParameter: SomeResource): String {
    // <- keyword
    //  ^ function
    //       ^ punctuation.bracket
    //        ^ variable.parameter
    //                       ^ type
    //                                      ^ type.builtin
        pre {
        // <- keyword
            self.greeting != "" : "greeting must not be empty"
            // <- variable
            //  ^ punctuation.delimiter
            //               ^ string
            //                    ^ string
        }

        return self.greeting
        // <- keyword
    }



    init() {
        self.greeting = "Hello World!"
        //               ^ string
    }
}
