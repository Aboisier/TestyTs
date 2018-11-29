import { TestCase } from '../testCase';
import { TestSuiteMetadata } from './testSuiteMetadata';
import { TestStatus } from '../testStatus';
import { Test } from '../interfaces/test';
import { TestsCollection } from '../utils/testsCollection';

/**
 * Marks a method inside a @testSuite decorated class as a test.
 *
 * @param name Name of the test, displayed in the test report.
 * @param testCases Allows to run the test multiple times with different arguments. Arguments will be passed to the test class.
 * @param timeout The test will automaticlaly fail if it has been running for longer than the specified timeout.
 */
export function test(name: string, testCases?: TestCase[], timeout: number = 2000) {
    return (target, key, descriptor) => {
        initializeTarget(target);
        const metadata = TestSuiteMetadata.getMetadataStore(target);
        if (metadata.tests.has(name)) {
            throw new Error(`A test named "${name}" is already registered. Copy pasta much?`);
        }

        metadata.tests.set(name, generateTest(testCases, TestStatus.Normal, descriptor.value, timeout));
    };
}

/**
 * Marks a method inside a @testSuite decorated class as a focused test.
 * If one or more tests are marked as focused, only those will be ran.
 *
 * @param name Name of the test, displayed in the test report.
 * @param testCases Allows to run the test multiple times with different arguments. Arguments will be passed to the test class.
 * @param timeout The test will automaticlaly fail if it has been running for longer than the specified timeout.
 */
export function ftest(name: string, testCases?: TestCase[], timeout: number = 2000) {
    return (target, key, descriptor) => {
        initializeTarget(target);
        const metadata = TestSuiteMetadata.getMetadataStore(target);
        if (metadata.tests.has(name)) {
            throw new Error(`A test named "${name}" is already registered. Copy pasta much?`);
        }

        metadata.tests.set(name, generateTest(testCases, TestStatus.Focused, descriptor.value, timeout));
    };
}

/** 
 * Marks a method inside a @testSuite decorated class as an ignored test.
 * Ignored tests will not be ran, but they will still appear in test reports.
 * 
 * @param name Name of the test, displayed in the test report.
 * @param testCases Allows to run the test multiple times with different arguments. Arguments will be passed to the test class.
 * @param timeout The test will automaticlaly fail if it has been running for longer than the specified timeout.
 */
export function xtest(name: string, testCases?: TestCase[], timeout: number = 2000) {
    return (target, key, descriptor) => {
        initializeTarget(target);
        const metadata = TestSuiteMetadata.getMetadataStore(target);
        if (metadata.tests.has(name)) {
            throw new Error(`A test named "${name}" is already registered. Copy pasta much?`);
        }

        metadata.tests.set(name, generateTest(testCases, TestStatus.Ignored, descriptor.value, timeout));
    };
}

function initializeTarget(target: any) {
    if (!target.tests) { target.tests = {}; }
    if (!target.focusedTests) { target.focusedTests = {}; }
    if (!target.ignoredTests) { target.ignoredTests = []; }
}

function generateTest(testCases: TestCase[], status: TestStatus, testMethod: Function, timeout: number): Test | TestsCollection {
    return testCases
        ? generateTestsFromTestcases(testMethod, testCases, status, timeout)
        : new Test(decorateStandaloneTest(testMethod, timeout), status);
}

function generateTestsFromTestcases(testMethod: Function, testCases: TestCase[], status: TestStatus, timeout: number): TestsCollection {
    const tests = new TestsCollection();
    for (const testCase of testCases) {
        tests.set(testCase.name, new Test(decorateTestWithTestcase(testMethod, testCase, timeout), status));
    }

    return tests;
}

function decorateStandaloneTest(testMethod: Function, timeout: number) {
    return async (context: any) => {
        await new Promise(async (resolve, reject) => {
            setTimeout(() => reject('Test has timed out.'), timeout);
            try {
                await testMethod.bind(context)();
            }
            catch (err) {
                reject(err);
            }

            resolve();
        });
    };
}

function decorateTestWithTestcase(testMethod: Function, testCase: TestCase, timeout: number) {
    return async (context: any) => {
        await new Promise(async (resolve, reject) => {
            setTimeout(() => reject('Test has timed out.'), timeout);
            try {
                await testMethod.bind(context)(...testCase.args);
            }
            catch (err) {
                reject(err);
            }

            resolve();
        });
    };
}