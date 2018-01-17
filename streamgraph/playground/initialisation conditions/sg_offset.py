import numpy as np

class OffsetFunctorBase:
    def __init__(self, N, fs, x = []):
        self.N = N
        self.fs = fs
        self.x = x
    def compute_Offset_curve(self):
        return [0 for _ in range(self.N)]

class OffsetFunctorZero(OffsetFunctorBase):
    def compute_offset_curve(self):
        return [0 for _ in range(self.N)]

class OffsetFunctorWeightedWiggle(OffsetFunctorBase):
    def __init__(self, N, fs, x):
        self.N = N
        self.fs = fs
        self.x = x

    def compute_offset_curve(self):
        N = self.N
        fs = self.fs
        x = self.x
        dg0 = [0 for i in range(N)]
        dfs = [self.__calculate_slope(x, fs[i]) for i in range(len(fs))]
        f_sum = [0 for i in range(N)]

        for i in range(N):
            for j in range(len(fs)):
                f_sum[i] += fs[j][i]

        for i in range(1, N):
            dg = 0
            for k in range(len(dfs)):
                df_sum = 0
                for l in range(1, k):
                    df_sum += dfs[l][i]
                dg += (dfs[k][i]/2 + df_sum) * fs[k][i]
            dg0[i] = -dg / f_sum[i]

        func = OffsetFunctorZero(N, fs)
        g = func.compute_offset_curve()

        ## rectangular numeric integration
        # (note - may have lag, but g0 is just an offset function so it shouldn't be
        # too much of an issue)
        for i in range(1, N):
            g[i] = g[i-1] + dg0[i] * (x[i] - x[i-1])
            
        return g

    def __calculate_slope(self, x, f):
        assert(len(x) == len(f))

        N =  len(f)
        df = [0 for i in range(N)]

        for i in range(1, N):
            df[i] = (f[i] - f[i-1]) / (x[i] - x[i-1])

        return df

class OffsetFunctorVariance(OffsetFunctorBase):
    def compute_offset_curve(self):
        N = self.N
        fs = self.fs
        g = [0 for i in range(N)]

        for i in range(N):
            for k,_ in enumerate(fs):
                for l in range(k+1):
                    g[i] += fs[l][i]
            g[i] *= -1/(1+N)

        return g

class OffsetFunctorCentered(OffsetFunctorBase):
    def compute_offset_curve(self):
        N = self.N
        fs = self.fs
        g = [0 for i in range(N)]

        for i in range(N):
            for f in fs:
                g[i] += f[i]
            g[i] *= -1/2

        return g

class OffsetGenerator:
    def __init__(self, method, x, fs):
        for f in fs:
            assert(len(f) == len(x))

        self.__x = x
        self.__fs = fs
        self.__N = len(x)

        offset_ww = OffsetFunctorWeightedWiggle(self.__N, self.__fs, self.__x)
        offset_v = OffsetFunctorVariance(self.__N, self.__fs, self.__x)
        offset_c = OffsetFunctorCentered(self.__N, self.__fs, self.__x)
        offset_z = OffsetFunctorZero(self.__N, self.__fs, self.__x)

        method_map = {
            'weighted_wiggle': offset_ww,
            'variance': offset_v,
            'centered': offset_c,
            'zero': offset_z
        }

        self.__gmap = offset_z # default to zero offset
        if method in method_map:
            self.__gmap = method_map[method]
    
    def stack_graphs(self):
        fs = self.__fs
        g0 = self.__gmap.compute_offset_curve()
        g_all = [g0]

        for f in fs:
            g = [g_all[-1][i] + f[i] for i,v in enumerate(f)]
            g_all.append(g)

        return g_all
