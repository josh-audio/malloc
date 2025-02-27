# Changelog

## February 2025

### Features:

- Malloc
  - Added next-fit allocation strategy
- UI
  - Memory addresses are now displayed as small labels above cells, and cells now contain memory values.
  - Added support for displaying memory addresses and values in hex. This can be changed with:
    ```
    setDisplayBase(10); // base 10
    setDisplayBase(16); // base 16
    ```
  - Memory cells are now editable - click in the cell to edit.
  - The visualization is now driven by the actual memory state. If the state is invalid, the visualization will reflect that.
- Language runtime
  - Added support for hex literals, e.g.:
    ```c
    int a = 0xFF;
    ```
  - `char` is now a byte, instead of an odd sort-of-string type.
  - Significantly improved type soundness. For example, the previous interpreter would allow this:
    ```c
    int a = 2.3;
    // a is now "sort of 2.3"

    a + 0.7; // -> 2.7
    ((double) a) + 0.7; // -> 3
    ```

    Now, these will evaluate to:
    ```c
    int a = 2.3;
    // a is now 2

    a + 0.7; // -> 2.7
    ((double) a) + 0.7; // -> 2.7
    ```

    Besides addressing some minor bugs, being more careful with types paves the way for better handling of new pointer types - see below for more.
  - Added support for pointer types, and for reading to and writing from memory. The end goal is to support at least some of the examples from OSTEP chapter 14, for example:
    ```c
    int *x = (int *) malloc(sizeof(int));
    ```

    ```c
    char *src = "hello";
    char *dst = (char *) malloc(strlen(src) + 1);
    strcpy(dst, src);
    ```

    The memory cells in the UI will update when they are written to.

    Pointers can be declared using C-style syntax:

    ```c
    // Not a good idea in real life, but totally valid here
    char* a = 0xAB;
    ```

    You can write to and read from pointers:
    
    ```c
    *a = 5; // writes a value of 5 to 0xAB
    *a; // -> 5
    ```

    And you can do plenty of more complex things:
    
    ```c
    // Gets the value at heap address a, casts it to a char*, and writes 10 to that address
    *((char*) *a) = 10;
    ```

### Maintenance:

- Malloc
  - Reimplemented malloc() and free() to work on real memory addresses instead of hidden flags
- Tooling
  - Ported to TypeScript / React 19 / Vite, with Zod for AST type safety
  - Refactored UI to use app-level state store with MobX
- UI
  - UI elements have been scaled to around 75% of their old sizes.
  - The memory area itself can now vertically scroll, and the jank around resizing the command area has been fixed.
