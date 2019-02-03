import { TestStatus } from '../testStatus';
import { TestSuiteInstance } from '../tests/testSuite';

/** 
 * Marks a class as a test suite. 
 * 
 * @param name Name of the test suite, displayed in the test report.
 */
export function TestSuite<T extends new(...args: any[]) => {}>(name?: string): any {
    return createTestSuiteDecoratorFactory<T>(TestStatus.Normal, name);
}

/** 
 * Marks a class as a focused test suite. If one or more test suites are marked as focused, only the those will be ran.
 * 
 * @param name Name of the test suite, displayed in the test report.
 */
export function FTestSuite<T extends new(...args: any[]) => {}>(name?: string): any {
    return createTestSuiteDecoratorFactory<T>(TestStatus.Focused, name);
}

/**
 * Marks a class as an ignored test suite. Its tests will not be ran, but will still show up in the test report.
 * 
 * @param name Name of the test suite, displayed in the test report.
 */
export function XTestSuite<T extends new(...args: any[]) => {}>(name?: string): any {
    return createTestSuiteDecoratorFactory<T>(TestStatus.Ignored, name);
}

/** 
 * @deprecated since 0.7.0. Prefer using the capitalized version.
 * Marks a class as a test suite. 
 * 
 * @param name Name of the test suite, displayed in the test report.
 */
export function testSuite<T extends new(...args: any[]) => {}>(name?: string): any {
    return TestSuite<T>(name);
}

/** 
 * @deprecated since 0.7.0. Prefer using the capitalized version.
 * Marks a class as a focused test suite. If one or more test suites are marked as focused, only the those will be ran.
 * 
 * @param name Name of the test suite, displayed in the test report.
 */
export function ftestSuite<T extends new(...args: any[]) => {}>(name?: string): any {
    return FTestSuite<T>(name);
}

/**
 * @deprecated since 0.7.0. Prefer using the capitalized version.
 * Marks a class as an ignored test suite. Its tests will not be ran, but will still show up in the test report.
 * 
 * @param name Name of the test suite, displayed in the test report.
 */
export function xtestSuite<T extends new(...args: any[]) => {}>(name?: string): any {
    return XTestSuite<T>(name);
}

function createTestSuiteDecoratorFactory<T extends new(...args: any[]) => {}>(status: TestStatus, name?: string) {
    return (constructor: T) => {
        name = name ? name : constructor.name;
        (constructor as any).__testSuiteInstance = createTestSuite(constructor, name, status);
        return constructor;
    };
}

function createTestSuite<T>(constructor: new () => T, name: string, status: TestStatus): TestSuiteInstance {
    const context = new constructor();
    const testSuiteInstance: TestSuiteInstance = (context as any).__testSuiteInstance;
    testSuiteInstance.name = name;
    testSuiteInstance.status = status;
    testSuiteInstance.context = context;
    return testSuiteInstance;
}