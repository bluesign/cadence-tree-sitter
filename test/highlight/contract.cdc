access(all)
contract HelloWorld {
// <- keyword

    access(all)
    let greeting: String


    // TODO: fix me! most of these are wrong!
    access(all)
    // <- keyword
    fun hello(): String {
    // <- type
    //   ^ variable
    //       ^ type
    //            ^ variable
        return self.greeting
        // <- type
    }



    init() {
    // <- type
        self.greeting = "Hello World!"
        //               ^ string
    }
}
