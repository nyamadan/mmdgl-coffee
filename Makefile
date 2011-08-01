LIB_SRC	= core.coffee binary.coffee encode.coffee pmd.coffee
LIB_JS	= mmdgl.js

BINTEST_SRC	= bintest.coffee
BINTEST_JS	= bintest.js

BINTEST_SRC	= pmdtest.coffee
BINTEST_JS	= pmdtest.js

all: $(LIB_JS) $(BINTEST_JS) $(PMD_TEST)

$(LIB_JS): $(LIB_SRC)
	coffee -j $@ -c $^

$(BINTEST_JS): $(BINTEST_SRC)
	coffee -j $@ -c $(BINTEST_SRC)

$(PMDTEST_JS): $(PMDTEST_SRC)
	coffee -j $@ -c $(PMDTEST_SRC)

clean:
	rm -f $(LIB_JS) $(BINTEST_JS)
