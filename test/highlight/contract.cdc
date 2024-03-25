import HelloWorld2 from 0x01
// <- keyword
//     ^ type
//                 ^ keyword
//                      ^ number

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

        init(someField: UFix64) {
        // <- function.builtin
        //   ^ variable.parameter
        //              ^ type.builtin

            self.someField = someField
        }
    }

    access(all)
    // <- keyword
    fun hello(someParameter: SomeResource): String {
    // <- keyword
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
