import { TestCaseInstance } from '../testCaseInstance';
import { TestStatus } from '../testStatus';
import { TestInstance } from '../tests/test';
import { TestSuiteInstance } from '../tests/testSuite';

/**
 * Marks a method inside a @TestSuite decorated class as a test.
 *
 * @param name Name of the test, displayed in the test report.
 */
export function Test(name?: string) {
    return generateDecoratorFunction(name, TestStatus.Normal);
}

/**
 * Marks a method inside a @TestSuite decorated class as a focused test.
 * If one or more tests are marked as focused, only those will be ran.
 *
 * @param name Name of the test, displayed in the test report.
 */
export function FTest(name?: string) {
    return generateDecoratorFunction(name, TestStatus.Focused);
}

/** 
 * Marks a method inside a @TestSuite decorated class as an ignored test.
 * Ignored tests will not be ran, but they will still appear in test reports.
 * 
 * @param name Name of the test, displayed in the test report.
 */
export function XTest(name?: string) {
    return generateDecoratorFunction(name, TestStatus.Ignored);
}

/**
 * @deprecated since 0.7.0. Prefer using the capitalized version.
 * Marks a method inside a @TestSuite decorated class as a test.
 *
 * @param name Name of the test, displayed in the test report.
 */
export function test(name?: string) {
    return Test(name);
}

/**
 * @deprecated since 0.7.0. Prefer using the capitalized version.
 * Marks a method inside a @TestSuite decorated class as a focused test.
 * If one or more tests are marked as focused, only those will be ran.
 *
 * @param name Name of the test, displayed in the test report.
 */
export function ftest(name?: string) {
    return FTest(name);
}

/** 
 * @deprecated since 0.7.0. Prefer using the capitalized version.
 * Marks a method inside a @TestSuite decorated class as an ignored test.
 * Ignored tests will not be ran, but they will still appear in test reports.
 * 
 * @param name Name of the test, displayed in the test report.
 */
export function xtest(name?: string) {
    return XTest(name);
}

function initializeTarget(target: any) {
    if (!target.__testSuiteInstance) {
        target.__testSuiteInstance = new TestSuiteInstance();
    }
    else {
        target.__testSuiteInstance = (target.__testSuiteInstance as TestSuiteInstance).clone();
    }
}

function generateDecoratorFunction(name: string, status: TestStatus) {
    return (target, key, descriptor) => {
        const timeout = getTimeout(target, key);
        const testCases = getTestCases(target, key);

        initializeTarget(target);
        const testSuiteInstance: TestSuiteInstance = target.__testSuiteInstance;

        name = name ? name : key;
        if (testSuiteInstance.has(name)) {
            throw new Error(`A test named "${name}" is already registered. Copy pasta much?`);
        }

        testSuiteInstance.set(name, generateTest(name, testCases, status, descriptor.value, timeout));
    };
}

function generateTest(name: string, testCases: TestCaseInstance[], status: TestStatus, testMethod: Function, timeout: number): TestInstance | TestSuiteInstance {
    return testCases
        ? generateTestsFromTestcases(name, testMethod, testCases, status, timeout)
        : new TestInstance(name, decorateTest(testMethod, timeout), status);
}

function generateTestsFromTestcases(name: string, testMethod: Function, testCases: TestCaseInstance[], status: TestStatus, timeout: number): TestSuiteInstance {
    const tests = new TestSuiteInstance();
    tests.name = name;
    for (const testCase of testCases) {
        const decoratedTestMethod = decorateTest(testMethod, timeout, testCase.args);
        tests.set(testCase.name, new TestInstance(testCase.name, decoratedTestMethod, status));
    }

    return tests;
}

function decorateTest(testMethod: Function, timeout: number, args: any[] = []) {
    return async (context: any) => {
        await new Promise(async (resolve, reject) => {
            setTimeout(() => reject('Test has timed out.'), timeout);
            try {
                await testMethod.bind(context)(...args);
            }
            catch (err) {
                reject(err);
            }

            resolve();
        });
    };
}

function getTimeout(target, key) {
    return target.__timeouts ? target.__timeouts[key] : 2000;
}

function getTestCases(target, key) {
    return target.__testCases ? target.__testCases[key] : undefined;
}