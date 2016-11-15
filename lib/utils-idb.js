function getIDBKeyRange() {
    /* global IDBKeyRange, webkitIDBKeyRange, mozIDBKeyRange */
    if (typeof IDBKeyRange !== 'undefined') {
        return IDBKeyRange;
    }
    if (typeof webkitIDBKeyRange !== 'undefined') {
        return webkitIDBKeyRange;
    }
    if (typeof mozIDBKeyRange !== 'undefined') {
        return mozIDBKeyRange;
    }
}

export var idbKeyRange = getIDBKeyRange();

export function openStoreTransaction(self, fn, mode) {
    return new Promise(function(resolve, reject) {
        var dbInfo = self._dbInfo;
        self.ready().then(function() {
            var transaction = dbInfo.db.transaction(dbInfo.storeName, 'readwrite');
            var store = transaction.objectStore(dbInfo.storeName);

            var req = fn(transaction, store);

            if (mode === 'readwrite') {
                transaction.oncomplete = function() {
                    resolve();
                };

                transaction.onabort = transaction.onerror = function() {
                    var err = req.error ? req.error : req.transaction.error;
                    reject(err);
                };
            } else {
                req.onsuccess = function() {
                    resolve(req.result);
                };

                req.onerror = function() {
                    reject(req.error);
                };
            }

        }).catch(reject);
    });
}
