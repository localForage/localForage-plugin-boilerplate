export function executeSqlAsync(transaction, sql, parameters) {
    return new Promise(function(resolve, reject) {
        transaction.executeSql(sql, parameters, function() {
            resolve();
        }, function(t, error) {
            reject(error);
        });
    });
}
