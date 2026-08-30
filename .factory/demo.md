# Demo sandbox

Open [the demo](/demo) or `/?demo=1` to load a complete Northstar launch review packet. It includes one PDF, two comments, one decision, one authorised source link, and two text attachments.

Demo text uses `demo:review-packet:*` local-storage keys. Normal drafts use `review-packet:*` keys. Demo files are created in memory and never enter either namespace. Use **Reset demo** to restore the sample. Use **Start for real** to remove all demo keys and return to an empty builder.

The service worker caches `/demo` and its sample shell. After the first online visit, the populated sample opens while offline.
