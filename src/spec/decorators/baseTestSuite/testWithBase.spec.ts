import { test } from '../../../lib/decorators/test.decorator';
import { createTestSuite, testSuite } from '../../../lib/decorators/testSuite.decorator';
import { TestStatus } from '../../../lib/testStatus';
import { TestSuiteWithBase, BaseTestSuite } from './testSuiteWithBaseTestSuite';
import { expect } from '../../../testyCore';
import { TestRunnerVisitor } from '../../../lib/tests/visitors/testRunnerVisitor';

@testSuite('Test Suite With Base Test Suite Tests')
export class BeforeAfterDecoratorsTestSuite {
    @test('the base and the actual test suite before and after methods are called.')
    private async trivialCase() {
        // Arrange
        const testSuite = createTestSuite(TestSuiteWithBase, 'Dummy Test Suite', TestStatus.Normal);
        const testRunnerVisitor = new TestRunnerVisitor();

        // Act
        const report = await testSuite.accept(testRunnerVisitor);

        // Assert
        expect.toBeEqual(testSuite.context.beforeAllExecuted[0], BaseTestSuite);
        expect.toBeEqual(testSuite.context.beforeAllExecuted[1], TestSuiteWithBase);
        expect.toBeEqual(testSuite.context.beforeEachExecuted[0], BaseTestSuite);
        expect.toBeEqual(testSuite.context.beforeEachExecuted[1], TestSuiteWithBase);
        expect.toBeEqual(testSuite.context.afterEachExecuted[0], BaseTestSuite);
        expect.toBeEqual(testSuite.context.afterEachExecuted[1], TestSuiteWithBase);
        expect.toBeEqual(testSuite.context.afterAllExecuted[0], BaseTestSuite);
        expect.toBeEqual(testSuite.context.afterAllExecuted[1], TestSuiteWithBase);
    }
}

