/*
 * Based on code from the Python mailing list,
 * https://mail.python.org/pipermail/edu-sig/2012-December/010721.html
 */
function pi_digits (n, f)
{
    var k = 2;
    var a = 4;
    var b = 1;
    var a1 = 12;
    var b1 = 4;
    var p, q, d, d1;
    var atmp, btmp, a1tmp, b1tmp;

    while (n > 0)
    {
        p = k*k;
        q = 2*k + 1;
        k += 1;
        atmp = a;
        btmp = b;
        a1tmp = a1;
        b1tmp = b1;
        a = a1tmp;
        b = b1tmp;
        a1 = p*atmp + q*a1tmp;
        b1 = p*btmp + q*b1tmp;
        d = a/b;
        d1 = a1/b1;
        while (d == d1)
        {
            f(Math.floor(d)); // Pass the digit to the callback
            n -= 1;
            a = 10*(a%b);
            a1 = 10*(a1%b1);
            d = a/b;
            d1 = a1/b1;
        }
    }
}
