// Test Framework for Room Management System
// Comprehensive testing suite for JavaScript components

class TestFramework {
  constructor() {
    this.tests = [];
    this.suites = [];
    this.results = {
      passed: 0,
      failed: 0,
      total: 0,
      suites: {}
    };
    this.currentSuite = null;
  }

  // Test suite management
  describe(suiteName, callback) {
    const previousSuite = this.currentSuite;
    this.currentSuite = suiteName;
    this.suites.push(suiteName);
    this.results.suites[suiteName] = { passed: 0, failed: 0, tests: [] };
    
    console.group(`📋 Test Suite: ${suiteName}`);
    callback();
    console.groupEnd();
    
    this.currentSuite = previousSuite;
  }

  // Individual test cases
  it(testName, testCallback) {
    const fullTestName = this.currentSuite ? `${this.currentSuite} > ${testName}` : testName;
    this.tests.push({
      name: fullTestName,
      suite: this.currentSuite,
      callback: testCallback
    });
  }

  // Assertion methods
  expect(actual) {
    return {
      toBe: (expected) => {
        if (actual !== expected) {
          throw new Error(`Expected ${actual} to be ${expected}`);
        }
      },
      toEqual: (expected) => {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
          throw new Error(`Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`);
        }
      },
      toBeTruthy: () => {
        if (!actual) {
          throw new Error(`Expected ${actual} to be truthy`);
        }
      },
      toBeFalsy: () => {
        if (actual) {
          throw new Error(`Expected ${actual} to be falsy`);
        }
      },
      toContain: (expected) => {
        if (!actual.includes(expected)) {
          throw new Error(`Expected ${actual} to contain ${expected}`);
        }
      },
      toThrow: () => {
        try {
          actual();
          throw new Error('Expected function to throw an error');
        } catch (e) {
          // Expected behavior
        }
      },
      toHaveProperty: (property) => {
        if (!(property in actual)) {
          throw new Error(`Expected object to have property ${property}`);
        }
      },
      toBeInstanceOf: (constructor) => {
        if (!(actual instanceof constructor)) {
          throw new Error(`Expected ${actual} to be instance of ${constructor.name}`);
        }
      }
    };
  }

  // Mock functions
  mock(originalFunction) {
    const mockFn = function(...args) {
      mockFn.calls.push(args);
      mockFn.callCount++;
      if (mockFn.mockReturnValue !== undefined) {
        return mockFn.mockReturnValue;
      }
      if (mockFn.mockImplementation) {
        return mockFn.mockImplementation(...args);
      }
    };
    
    mockFn.calls = [];
    mockFn.callCount = 0;
    mockFn.mockReturnValue = undefined;
    mockFn.mockImplementation = null;
    
    mockFn.mockReturnValueOnce = (value) => {
      mockFn.mockReturnValue = value;
      return mockFn;
    };
    
    mockFn.mockImplementationOnce = (fn) => {
      mockFn.mockImplementation = fn;
      return mockFn;
    };
    
    return mockFn;
  }

  // Setup and teardown
  beforeEach(callback) {
    this.beforeEachCallback = callback;
  }

  afterEach(callback) {
    this.afterEachCallback = callback;
  }

  // Run all tests
  async runTests() {
    console.clear();
    console.log('🚀 Starting Room Management System Test Suite');
    console.log('================================================');
    
    for (const test of this.tests) {
      try {
        // Run setup
        if (this.beforeEachCallback) {
          await this.beforeEachCallback();
        }
        
        // Run test
        await test.callback();
        
        // Test passed
        this.results.passed++;
        this.results.total++;
        if (test.suite) {
          this.results.suites[test.suite].passed++;
          this.results.suites[test.suite].tests.push({ name: test.name, status: 'passed' });
        }
        
        console.log(`✅ ${test.name}`);
        
      } catch (error) {
        // Test failed
        this.results.failed++;
        this.results.total++;
        if (test.suite) {
          this.results.suites[test.suite].failed++;
          this.results.suites[test.suite].tests.push({ name: test.name, status: 'failed', error: error.message });
        }
        
        console.error(`❌ ${test.name}`);
        console.error(`   Error: ${error.message}`);
      }
      
      // Run teardown
      if (this.afterEachCallback) {
        await this.afterEachCallback();
      }
    }
    
    this.printResults();
  }

  printResults() {
    console.log('\n📊 Test Results Summary');
    console.log('========================');
    console.log(`Total Tests: ${this.results.total}`);
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📈 Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);
    
    console.log('\n📋 Test Suites:');
    Object.entries(this.results.suites).forEach(([suite, results]) => {
      const total = results.passed + results.failed;
      const rate = total > 0 ? ((results.passed / total) * 100).toFixed(1) : 0;
      console.log(`  ${suite}: ${results.passed}/${total} (${rate}%)`);
    });
  }

  // DOM testing utilities
  createTestDOM() {
    // Create a test container
    const container = document.createElement('div');
    container.id = 'test-container';
    container.style.position = 'absolute';
    container.style.top = '-9999px';
    container.style.left = '-9999px';
    document.body.appendChild(container);
    return container;
  }

  cleanupTestDOM() {
    const container = document.getElementById('test-container');
    if (container) {
      container.remove();
    }
  }

  // Wait for async operations
  waitFor(condition, timeout = 1000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const check = () => {
        if (condition()) {
          resolve();
        } else if (Date.now() - startTime > timeout) {
          reject(new Error('Timeout waiting for condition'));
        } else {
          setTimeout(check, 10);
        }
      };
      
      check();
    });
  }

  // Simulate user events
  fireEvent(element, eventType, eventOptions = {}) {
    const event = new Event(eventType, { bubbles: true, ...eventOptions });
    element.dispatchEvent(event);
  }

  // Performance testing
  benchmark(name, fn, iterations = 1000) {
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      fn();
    }
    const end = performance.now();
    const avgTime = (end - start) / iterations;
    console.log(`⏱️ Benchmark ${name}: ${avgTime.toFixed(3)}ms avg (${iterations} iterations)`);
    return avgTime;
  }
}

// Create global test framework instance
window.testFramework = new TestFramework();
const { describe, it, expect, beforeEach, afterEach } = window.testFramework;

// Export for use in Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TestFramework;
}