import pathlib

path = pathlib.Path(r"C:\Users\Prince-Z\Documents\Web Project\markdown-to-word\app\workspace\editor\page.tsx")
content = path.read_text(encoding="utf-8")

marker = '  }, [commitDocument]);\n\n  const downloadPdf'
worker_code = '''  }, [commitDocument]);

  const pdfWorkerRef = useRef<ReturnType<typeof createWorkerProxy> | null>(null);
  const docxWorkerRef = useRef<ReturnType<typeof createWorkerProxy> | null>(null);

  useEffect(() => {
    pdfWorkerRef.current = createWorkerProxy(new URL("../../../lib/workers/export-pdf.worker.ts", import.meta.url));
    docxWorkerRef.current = createWorkerProxy(new URL("../../../lib/workers/export-docx.worker.ts", import.meta.url));
    return () => {
      pdfWorkerRef.current?.terminate();
      docxWorkerRef.current?.terminate();
    };
  }, []);
"""

if marker in content:
    content = content.replace(marker, worker_code)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print('Inserted successfully')
else:
    print('Marker not found')
    idx = content.find('  }, [commitDocument]);')
    if idx >= 0:
        print(f'Found at {idx}')
        print(repr(content[idx:idx+150]))
