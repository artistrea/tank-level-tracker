#include <Narcoleptic.h>
#include "longSleep.h"

void longSleep(long milliseconds) {
    while (milliseconds > 0) {
        // max sleep duration permitted
        if (milliseconds > 8000) {
            milliseconds -= 8000;
            Narcoleptic.delay(8000);
        } else {
            Narcoleptic.delay(milliseconds);
            break;
        }
    }
}