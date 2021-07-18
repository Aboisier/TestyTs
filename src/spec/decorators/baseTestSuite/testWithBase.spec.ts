import { expect } from '../../../lib/assertion/expect';
import { Test, TestSuite, XTest } from '../../../testyCore';
import { TestSuiteTestsBase } from '../../utils/testSuiteTestsBase';
import { TestUtils } from '../../utils/testUtils';
import { TestSuiteA, TestSuiteB } from './baseWithChildren';
import { BaseTestSuite, TestSuiteWithBase } from './testSuiteWithBase';

@TestSuite('Test Suite With Base Test Suite Tests')
export class BeforeAfterDecoratorsTestSuite extends TestSuiteTestsBase {
  private foo = null;

  @Test('the base and the actual test suite before and after methods are called.')
  public async trivialCase() {
    // Arrange
    const testSuite = TestUtils.getInstance(TestSuiteWithBase);

    // Act
    await testSuite.accept(this.visitor);

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

  @XTest('base with multiple children')
  public async baseWithMultipleChildren() {
    // Arrange
    const a = TestUtils.getInstance(TestSuiteA);
    const b = TestUtils.getInstance(TestSuiteB);

    // Assert
    expect.arraysToBeEqual(a.testIds, ['testA']);
    expect.arraysToBeEqual(b.testIds, ['testB']);
  }
}
