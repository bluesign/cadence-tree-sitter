access(all)
contract HelloWorld {
// <- keyword

    access(all) let greeting: String
    //          ^ type.qualifier
    //              ^ variable

    access(all) resource SomeResource {
        access(all) var someField: UFix64,

        init(someField: UFix64) {
        // <- variable
        //   ^ type
        //              ^ type
            self.someField = someField
        }

    }

    // TODO: fix me! most of these are wrong!
    access(all)
    // <- keyword
    fun hello(someParameter: SomeResource): String {
    // <- keyword
    //   ^ variable
    //       ^ punctuation.bracket
    //        ^ parameter
    //                       ^ variable
    //                                      ^ variable
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
    // <- type
        self.greeting = "Hello World!"
        //               ^ string
    }
}
