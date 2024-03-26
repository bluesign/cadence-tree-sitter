import HelloWorld2 from 0x01
// <- keyword
//     ^ type
//                 ^ keyword
//                      ^ number
import Crypto
// <- keyword
//     ^ type

/// This is a simple HelloWorld contract
// <- comment
access(all)
// <- keyword
//     ^ label
contract HelloWorld : HelloWorld2 {
// <- keyword
//       ^ type
//                    ^ type

// some comment
// <- comment

    access(all) entitlement NodeOperator
    // <- keyword
    //          ^ keyword
    //                      ^ label

    access(all) let greeting: String
    // <- keyword
    //          ^ type.qualifier
    //              ^ variable
    //                        ^ type.builtin

    access(all) resource SomeResource {
    // <- keyword
    //                   ^ type
        access(all) var someField: UFix64
        //          ^ type.qualifier
        //              ^ variable
        //                         ^ type.builtin
        access(contract) var someBool: Bool
        //          ^ label

        init(someField: UFix64) {
        // <- constructor
        //   ^ variable.parameter
        //              ^ type.builtin

            self.someField = someField
            self.someBool = true
            // <- variable.builtin
            //              ^ boolean
        }
    }

    access(all) struct SomeStruct {
        view init(_ someField: UFix64) {
        // <- keyword
        //   ^ constructor
        //          ^ variable.parameter
        //                     ^ type.builtin
        }
    }

    access(mapping Identity) fun hello(){}
    // <- keyword
    //     ^ keyword
    //             ^ label

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
            // <- variable.builtin
            //  ^ punctuation.delimiter
            //               ^ string
            //                    ^ string
        }

        emit HelloEvent (
        // <- keyword
        //   ^ type
            prop1: HelloWorld2.prop1,
            prop2: HelloWorld2.fn1(),
            prop3: HelloWorld2.prop1 + HelloWorld2.fn1(),
        )

        return self.greeting
        // <- keyword
    }


    access(all)
    // <- keyword
    fun returnArray(someParameter: @HelloWorld2.TypeA): [String] {
    // <- keyword
    //  ^ function
    //              ^ variable.parameter
    //                              ^ type
    //                                                  ^ punctuation.bracket
    //
        panic("oh no!")
        // <- function.builtin
        return ["Hello", "World"]
        // <- keyword
        //     ^ punctuation.bracket
        //      ^ string
        //               ^ string
    }

    init() {
    // <- constructor
        self.greeting = "Hello World!"
        //               ^ string
        self.MinterStoragePath = /storage/cadenceExampleNFTMinter
        // <- variable.builtin
        //  ^ punctuation.delimiter
        //                       ^ string
        //                        ^ string

        self.account.storage.save(<- create Heartbeat(label: "test"), to: self.HeartbeatStoragePath)
        // <- variable.builtin
        //                           ^ keyword
        //                                  ^ type

        self.totalSupply = 0.0
        // <- variable.builtin
        //                 ^ number

        if conditionIsTrue() {
        // <- keyword
            log("Hello, World!")
        )
    }
}
