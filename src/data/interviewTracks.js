export const INTERVIEW_TRACKS = [
  {
    id: 'dsa',
    title: 'Data Structures & Algorithms',
    role: 'SDE Core Problem Solving',
    icon: 'Binary',
    color: 'from-blue-500 to-cyan-500',
    description: 'Array manipulations, Dynamic Programming, Graphs, Two Pointers, and algorithmic optimization.',
    defaultLanguage: 'javascript',
    sampleQuestions: [
      {
        title: 'Two Sum II - Input Array Is Sorted',
        difficulty: 'Medium',
        tags: ['Two Pointers', 'Arrays', 'Binary Search'],
        description: 'Given a 1-indexed array of integers numbers that is already sorted in non-decreasing order, find two numbers such that they add up to a specific target number.\n\nReturn the indices of the two numbers, 1-indexed, as an integer array of size 2. You must use constant extra space O(1).',
        starterCode: {
          javascript: `/**
 * @param {number[]} numbers - Sorted array in ascending order
 * @param {number} target - Target sum
 * @return {number[]} - 1-based indices [index1, index2]
 */
function twoSum(numbers, target) {
  // TODO: Write your O(n) time and O(1) space two-pointer solution
  
}

// Test your implementation
console.log(twoSum([2, 7, 11, 15], 9)); // Expected: [1, 2]
console.log(twoSum([2, 3, 4], 6));       // Expected: [1, 3]`,
          python: `def two_sum(numbers: list[int], target: int) -> list[int]:
    """Find two numbers that sum up to target in sorted array O(1) space."""
    # TODO: Write your O(n) time and O(1) space solution
    pass

# Test your implementation
print(two_sum([2, 7, 11, 15], 9)) # Expected: [1, 2]
print(two_sum([2, 3, 4], 6))       # Expected: [1, 3]`
        }
      }
    ]
  },
  {
    id: 'frontend',
    title: 'Frontend Architecture & React',
    role: 'Senior Frontend Engineer',
    icon: 'Layout',
    color: 'from-indigo-500 to-purple-500',
    description: 'React internals, custom hooks, virtual DOM, performance optimization, and responsive design systems.',
    defaultLanguage: 'javascript',
    sampleQuestions: [
      {
        title: 'Implement a Debounce Function with Immediate Flag',
        difficulty: 'Medium',
        tags: ['JavaScript', 'Closures', 'Async', 'Event Handling'],
        description: 'Create a custom debounce utility function in vanilla JavaScript that limits the execution rate of an expensive function. Support an optional `immediate` execution flag.',
        starterCode: {
          javascript: `/**
 * Creates a debounced function that delays invoking func until after wait milliseconds.
 * @param {Function} func The function to debounce.
 * @param {number} wait The delay in milliseconds.
 * @param {boolean} immediate Whether to invoke on the leading edge.
 */
function debounce(func, wait, immediate = false) {
  // TODO: Implement your debounce function here
  
}

// Test call
const log = debounce((msg) => console.log('Called:', msg), 300);
log('Test 1');
log('Test 2');`
        }
      }
    ]
  },
  {
    id: 'backend',
    title: 'Backend Systems & API Design',
    role: 'Backend / Systems Engineer',
    icon: 'Server',
    color: 'from-emerald-500 to-teal-500',
    description: 'REST/gRPC API design, database indexing, caching strategies, rate limiters, and microservice resilience.',
    defaultLanguage: 'javascript',
    sampleQuestions: [
      {
        title: 'Token Bucket Rate Limiter Algorithm',
        difficulty: 'Hard',
        tags: ['Distributed Systems', 'Rate Limiting', 'Concurrency'],
        description: 'Design and implement an in-memory Token Bucket rate limiter class. It should refill tokens at a constant rate and allow bursts up to the max capacity.',
        starterCode: {
          javascript: `class TokenBucket {
  constructor(capacity, refillRatePerSecond) {
    // TODO: Initialize capacity, current tokens, and timestamp
  }

  allowRequest(tokensRequired = 1) {
    // TODO: Refill elapsed tokens and check if request is allowed
    return false;
  }
}

const limiter = new TokenBucket(5, 2); // 5 capacity, refills 2 tokens/sec
console.log('Request 1:', limiter.allowRequest());
console.log('Request 2:', limiter.allowRequest());`
        }
      }
    ]
  },
  {
    id: 'oop_lld',
    title: 'OOPs & Low-Level System Design (LLD)',
    role: 'Software Design Engineer (LLD)',
    icon: 'Layers',
    color: 'from-violet-500 to-indigo-500',
    description: 'Design patterns (Factory, Strategy, Observer), SOLID principles, and clean class encapsulation for production.',
    defaultLanguage: 'javascript',
    sampleQuestions: [
      {
        title: 'Design an LRU Cache with O(1) Get & Put (OOPs Architecture)',
        difficulty: 'Hard',
        tags: ['OOPs', 'Design Patterns', 'Doubly Linked List', 'Hash Map'],
        description: 'Design and implement an in-memory Least Recently Used (LRU) Cache class adhering to OOP design principles.\n\nImplement the LRUCache class:\n- LRUCache(int capacity) Initialize the LRU cache with positive size capacity.\n- int get(int key) Return value of key if exists, otherwise return -1.\n- void put(int key, int value) Update or insert key-value. When capacity reached, evict the least recently used key.\nBoth functions must run in O(1) average time complexity.',
        starterCode: {
          javascript: `/**
 * Design an in-memory LRU Cache with O(1) get and put operations
 */
class LRUCache {
  constructor(capacity) {
    // TODO: Initialize data structures (e.g. Map, Doubly Linked List)
    this.capacity = capacity;
  }

  get(key) {
    // TODO: Return value if key exists, otherwise return -1
    return -1;
  }

  put(key, val) {
    // TODO: Insert/update key and evict least recently used if over capacity
  }
}

// Test verification
const cache = new LRUCache(2);
cache.put(1, 1);
cache.put(2, 2);
console.log('Get 1:', cache.get(1)); // Expected: 1
cache.put(3, 3);                    // Evicts key 2
console.log('Get 2:', cache.get(2)); // Expected: -1`
        }
      }
    ]
  },
  {
    id: 'system_design',
    title: 'System Design & High-Level Architecture',
    role: 'Staff / Tech Lead',
    icon: 'Cpu',
    color: 'from-amber-500 to-rose-500',
    description: 'Scalability, microservices, CAP theorem, message queues (Kafka), Redis caching, and database sharding.',
    defaultLanguage: 'javascript',
    sampleQuestions: [
      {
        title: 'Design a Real-Time URL Shortener (TinyURL)',
        difficulty: 'Hard',
        tags: ['Scalability', 'Hashing', 'Base62', 'Caching'],
        description: 'Design a scalable URL shortening service capable of handling 100M new URLs per month and 1B redirects. Discuss API endpoints, base62 encoding vs MD5, database schema, and Redis caching strategy. Use the Whiteboard tab to sketch architectural blocks!',
        starterCode: {
          javascript: `/**
 * System Component Specs:
 * - 100 Million URLs/month => ~40 writes/second
 * - 10:1 Read-to-Write ratio => ~400 reads/second
 */

function base62Encode(uniqueCounterId) {
  // TODO: Convert a 64-bit auto-increment integer ID to a 7-character Base62 string
  
}

console.log("Encoded ID 125309:", base62Encode(125309));`
        }
      }
    ]
  }
];

export const EXPERIENCE_LEVELS = [
  { id: 'intern', label: 'Intern / Fresher', desc: 'Focus on core concepts, clean code & fundamentals' },
  { id: 'mid', label: 'Mid-Level (1-3 yrs)', desc: 'Edge cases, clean architecture, time/space tradeoffs' },
  { id: 'senior', label: 'Senior (4+ yrs)', desc: 'High scale, system tradeoffs, failure modes & mentorship' }
];

export const AI_PROVIDERS = [
  { id: 'demo', name: 'Interactive Demo Mode', badge: '100% Free / Instant', desc: 'Runs instantly without any API key or local setup. Best for instant testing!' },
  { id: 'gemini', name: 'Google Gemini 1.5 Flash', badge: 'Recommended Cloud', desc: 'Super-fast, free tier via Google AI Studio. Best real-time voice latency.' },
  { id: 'ollama', name: 'Ollama (Local LLM)', badge: 'Privacy / Offline', desc: 'Zero cloud cost, connects to http://localhost:11434 with llama3.2.' },
  { id: 'openai', name: 'OpenAI GPT-4o-mini', badge: 'Cloud API', desc: 'Standard OpenAI API integration with your personal API key.' }
];
