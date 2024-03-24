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

    access(all) let greeting: String
    //          ^ type.qualifier
    //              ^ variable
    //                        ^ type

    access(all) resource SomeResource {
    //                   ^ type
        access(all) var someField: UFix64
        //              ^ variable
        //                         ^ type

        init(someField: UFix64) {
        // <- function.builtin
        //   ^ variable.parameter
        //              ^ type
            self.someField = someField
        }

    }

    // TODO: fix me! most of these are wrong!
    access(all)
    // <- keyword
    fun hello(someParameter: SomeResource): String {
    // <- keyword
    //       ^ punctuation.bracket
    //        ^ variable.parameter
    //                       ^ type
    //                                      ^ type
        pre {
        // <- keyword
            self.greeting != "" : "greeting must not be empty"
            // <- variable
            //  ^ punctuation.delimiter
            //               ^ string
        }

        return self.greeting
        // <- keyword
    }



    init() {
        self.greeting = "Hello World!"
        //               ^ string
    }
}
