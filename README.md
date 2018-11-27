# TestyTs
[![Build Status](https://travis-ci.com/Aboisier/TestyTs.svg?token=vuBsBM3yD6PMvt3zwT9s&branch=master)](https://travis-ci.com/Aboisier/TestyTs)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FAboisier%2FTestyTs.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2FAboisier%2FTestyTs?ref=badge_shield)


TestyTs is a modern TypeScript testing framework.

## Why?
Writing tests should be fun. The other testing framework solutions do not make use of the full power of TypeScript. This one uses decorators and OOP and stuff. Therefore, it makes writing tests fun.

## Installation

```
$ npm install --save-dev testyts
$ npm install -g testyts
```

## Setup

To generate a testy.json configuration file, use the following cmmand:

```
$ testyts init
```


## Write some tests

### The basics 
Writing tests with Testy is simple. Don't forget to export your test suites though. Otherwise, they won't be discovered by the test runner.

```ts
@testSuite('Sum Test Suite')
export class MyTestSuite {

    @test('One plus one, should equal two')
    onePlusOne() {
        // Act
        const result = 1 + 1;
        
        // Assert
        expect.toBeEqual(result, 2);
    }
}
```

### Setup and teardown

Testy provides setup and teardown hooks.

```ts
@testSuite('Sum Test Suite')
export class MyTestSuite {

    @beforeAll()
    beforeAll() {
        // This is executed before all the tests
    }

    @beforeEach()
    beforeEach() {
        // This is executed before each test
    }

    @afterEach()
    afterEach() {
        // This is executed after each test
    }
    
    @afterAll()
    afterAll() {
        // This is executed after all the tests
    }
}
```

### Reuse code!

This is where stuff gets interesting. Testy allows you to use base test classes. The base test can have setup and teardown methods. Your child test suite may also have setup and teardown methods. In that case, the base test methods are executed first.

```ts
class MyBaseTestSuite{
    // Setup/teardown extravaganza
}

@testSuite('My Test Suite')
class MyTestSuite extends MyBaseTestSuite {
    // My tests
}
```

### Test cases

```ts
@testSuite('Sum Test Suite')
export class MyTestSuite {
    @test('Addition', [
          new TestCase('Two plus two is four', 2, 2, 4),
          new TestCase(`Minus one that's three`, 4, -1, 3)
    ])
    onePlusOne(a: number, b: number, result: number) {
        expect.toBeEqual(a + b, result);
    }
}
```

### Asserting

There's a whole bunch of assertion methods and also a dash of syntactic sugar sexyness in the expect class.

```ts
expect.toBeTrue(2 > 1);
expect.toBeEqual('a', 'a');
expect.not.toBeEqual('p', 'np');
expect.toThrow(() => someNastyMethod());
expect.toBeSorted.inAscendingOrder([0, 1, 1, 2, 3, 5, 8]);
// More!
```

### Ignoring or focusing some tests

You can ignore tests by adding an `x` before a test suite or a specific test decorator. Ignored tests will still show up in the test report, but they will be marked as ignored.

```ts
@xtestSuite('Sum Test Suite') // This test suite will be ignored
export class MyTestSuite { 
// Your tests
}

@testSuite('Sum Test Suite')
export class MyTestSuite {
    @xtest('One plus one, should equal two') // This test will be ignored
    onePlusOne() {
       // Some test
    }
}
```

You can also focus tests by adding an `f` before a test suite or a specific test decorator. If one test or test suites are focused, only those will be runned. The others will be reported as ignored.

```ts
@ftestSuite('Sum Test Suite') // This test suite will be focused.
export class MyTestSuite { 
...
}

@testSuite('Sum Test Suite')
export class MyTestSuite {
    @ftest('One plus one, should equal two') // This test will be focused
    onePlusOne() {
       // Your test
    }
}
```

## Run the tests

To run the tests, use the following command

```
$ testyts
$ testyts --config custom/config/file.json // To specify a custom configuration file
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[ISC](./LICENSE)
