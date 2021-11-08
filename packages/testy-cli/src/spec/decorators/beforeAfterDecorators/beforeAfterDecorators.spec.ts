import { expect } from '../../../lib/assertion/expect';
import { TestCase } from '../../../lib/decorators/testCase.decorator';
import { Report } from '../../../lib/reporting/report/report';
import { TestRunnerVisitor } from '../../../lib/tests/visitors/testRunnerVisitor';
import { TestVisitor } from '../../../lib/tests/visitors/testVisitor';
import { BeforeEach, Test, TestResult, TestSuite } from '../../../testyCore';
import { getProcessMock, ProcessMock } from '../../utils/processMock';
import { TestUtils } from '../../utils/testUtils';
import { NormalBeforeAfterTestSuite } from './normalBeforeAfterTestSuite';
import { ThrowsDuringAfterAllTestSuite } from './throwsDuringAfterAllTestSuite';
import { ThrowsDuringAfterEachTestSuite } from './throwsDuringAfterEachTestSuite';
import { ThrowsDuringBeforeAllTestSuite } from './throwsDuringBeforeAllTestSuite';
import { ThrowsDuringBeforeEachTestSuite } from './throwsDuringBeforeEachTestSuite';

@TestSuite('Before and After Decorators Test Suite')
export class BeforeAfterDecoratorsTestSuite {
  // tODO: This test suite should extend TestSuiteTestsBase when #8 is fixed.
  protected visitor: TestVisitor<Report>;
  protected processMock: ProcessMock;

  @BeforeEach()
  private beforeEach() {
    this.processMock = getProcessMock();
    this.visitor = new TestRunnerVisitor(this.processMock, null);
  }

  @Test('beforeAll, beforeEach, afterEach and afterAll are called the right amount of time.')
  private async trivialCase() {
    // arrange
    const testSuite = TestUtils.getInstance(NormalBeforeAfterTestSuite);

    // act
    const report = await testSuite.accept(this.visitor);

    // assert
    expect.toBeEqual(testSuite.context.numberOfBeforeAllExecutions, 1);
    expect.toBeEqual(testSuite.context.numberOfBeforeEachExecutions, 5);
    expect.toBeEqual(testSuite.context.numberOfAfterEachExecutions, 5);
    expect.toBeEqual(testSuite.context.numberOfAfterAllExecutions, 1);
    expect.toBeEqual(report.numberOfTests, 6);
    this.processMock.expectSuccess();
  }

  @Test('Before and after methods failures')
  @TestCase('beforeAll throws, should return a failed test report', ThrowsDuringBeforeAllTestSuite, 6)
  @TestCase('beforeEach throws, should return a failed test report', ThrowsDuringBeforeEachTestSuite, 6)
  @TestCase('afterEach throws, should return a failed test report', ThrowsDuringAfterEachTestSuite, 6)
  @TestCase('afterAll throws, should return a failed test report', ThrowsDuringAfterAllTestSuite, 6)
  private async beforeOfAfterMethodFails(testSuiteClass: any, numberOfTests: number) {
    // arrange
    const testSuite = TestUtils.getInstance(testSuiteClass);

    // act
    const report = await testSuite.accept(this.visitor);

    // assert
    expect.toBeDefined(report);
    expect.toBeEqual(report.result, TestResult.Failure);
    expect.toBeEqual(report.numberOfTests, numberOfTests, 'Expected all tests to be part of the report.');
    this.processMock.expectFailure();
  }
}
