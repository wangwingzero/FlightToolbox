# 管制员 一 飞行员数据链通信（CPDLC）电文集

1. 上行电文  
2. 下行电文

# 1. 上行电文

表 A5-1 回答/认收 (上行)  

<table><tr><td></td><td>电文目的/用途</td><td>电文规定格式</td><td>紧急</td><td>告警</td><td>回答</td></tr><tr><td>0</td><td>表示 ATC 不能同意请求。</td><td>UNABLE
不能</td><td>N</td><td>M</td><td>N</td></tr><tr><td>1</td><td>表示 ATC 收到电文，将予以答复。</td><td>STANDBY
请等候</td><td>N</td><td>L</td><td>N</td></tr><tr><td>2</td><td>表示 ATC 收到请求，但推迟到以后答复。</td><td>REQUEST DEFERRED
请求暂缓</td><td>N</td><td>L</td><td>N</td></tr><tr><td>3</td><td>表示 ATC 收到并明白电文。</td><td>ROGER
明白</td><td>N</td><td>L</td><td>N</td></tr><tr><td>4</td><td>是、对。</td><td>AFFIRM
是、对</td><td>N</td><td>L</td><td>N</td></tr><tr><td>5</td><td>不是、不对。</td><td>NEGATIVE
不是、不对</td><td>N</td><td>L</td><td>N</td></tr><tr><td>235</td><td>通知已收到非法干扰的电文。</td><td>ROGER 7500
收到 7500</td><td>U</td><td>H</td><td>N</td></tr><tr><td>211</td><td>表示 ATC 收到请求并已转发下一管制当局。</td><td>REQUEST FORWARDED
请求已转出</td><td>N</td><td>L</td><td>N</td></tr><tr><td>218</td><td>通知飞行员，地面已收到请求。</td><td>REQUEST ALREADY RECEIVED
请求已收悉</td><td>L</td><td>N</td><td>N</td></tr></table>

表 A5-2 垂直许可 (上行)  

<table><tr><td></td><td>电文目的/用途</td><td>电文规定格式</td><td>紧急</td><td>告警</td><td>回答</td></tr><tr><td>6</td><td>通知应等候高度层改变的指令。</td><td>EXPECT(level)
预期 (高度层)</td><td>L</td><td>L</td><td>R</td></tr><tr><td>7</td><td>通知航空器应等候在指定时间开始爬升的指令。</td><td>EXPECT CLIMB AT (time)
预期在 (时间) 爬升</td><td>L</td><td>L</td><td>R</td></tr><tr><td>8</td><td>通知航空器应等候在指定位置开始爬升的指令。</td><td>EXPECT CLIMB AT (position)
预期在 (位置) 爬升</td><td>L</td><td>L</td><td>R</td></tr><tr><td>9</td><td>通知航空器应等候在指定时间开始下降的指令。</td><td>EXPECT DESCENT AT (time)
预期在 (时间) 下降</td><td>L</td><td>L</td><td>R</td></tr><tr><td>10</td><td>通知航空器应等候在指定位置开始下降的指令。</td><td>EXPECT DESCENT AT (position)
预期在 (位置) 下降</td><td>L</td><td>L</td><td>R</td></tr><tr><td>11</td><td>通知航空器应等候在指定时间开始巡航爬升的指令。</td><td>EXPECT CRUISE CLIMB AT (time)
预期在 (时间) 巡航爬升</td><td>L</td><td>L</td><td>R</td></tr><tr><td>12</td><td>通知航空器应等候在指定位置开始巡航爬升的指令。</td><td>EXCEPT CRUISE CLIMB AT (position)预期在(位置)巡航爬升</td><td>L</td><td>L</td><td>R</td></tr><tr><td>13</td><td>(预留)</td><td></td><td>L</td><td>L</td><td>R</td></tr><tr><td>14</td><td>(预留)</td><td></td><td>L</td><td>L</td><td>R</td></tr><tr><td>15</td><td>(预留)</td><td></td><td>L</td><td>L</td><td>R</td></tr><tr><td>16</td><td>(预留)</td><td></td><td>L</td><td>L</td><td>R</td></tr><tr><td>17</td><td>(预留)</td><td></td><td>L</td><td>L</td><td>R</td></tr><tr><td>18</td><td>(预留)</td><td></td><td>L</td><td>L</td><td>R</td></tr><tr><td>19</td><td>指示保持指定高度层。</td><td>MAINTAIN (level)保持(高度层)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>20</td><td>指示开始向指定高度层爬升,并在到达后即保持该高度层。</td><td>CLIMB TO (level)爬升到(高度层)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>21</td><td>指示在指定时间开始向指定高度层爬升,并在到达后即保持该高度层。</td><td>AT (time) CLIMB TO (level)在(时间)爬升到(高度层)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>22</td><td>指示在指定位置开始向指定高度层爬升,并在到达后即保持该高度层。</td><td>AT (position) CLIMB TO (level)在(位置)爬升到(高度层)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>185</td><td>(预留)</td><td></td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>23</td><td>指示开始向指定高度层下降,并在到达后即保持该高度层。</td><td>DESCEND TO (level)下降到(高度层)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>24</td><td>指示在指定时间开始向指定高度层下降,并在到达后即保持该高度层。</td><td>AT (time) DESCEND TO (level)在(时间)下降至(高度层)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>25</td><td>指示在指定位置开始向指定高度层下降,并在到达后保持即保持该高度层。</td><td>AT (position) DESCEND TO (level)在(位置)下降至(高度层)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>186</td><td>(预留)</td><td></td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>26</td><td>指示开始爬升,其爬升率应保证在指定时间或之前到达指定高度层。当电报内容未连接有其他垂直许可时,指定高度须是保持的指配高度。</td><td>CLIMB TO REACH (level) BY (time)在(时间)之前爬升到(高度层)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>27</td><td>指示开始爬升,其爬升率应保证在到达指定位置之时或之前到达指定高度层。当电报内容未连接有其他垂直许可时,指定高度须是保持的指配高度。</td><td>CLIMB TO REACH (level) BY (position)在(位置)之前爬升到(高度层)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>28</td><td>指示开始下降,其下降率应保证在指定时间或之前到达指定高度层。当电报内容未连接有其他垂直许可时,指定高度须是保持的指配高度。</td><td>DESCEND TO REACH (level) BY (time)在(时间)之前下降至(高度层)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>29</td><td>指示开始下降,其下降率应保证在到达指定位置之时或之前到达指定高度层。当电报内容未连接有其他垂直许可时,指定高度须是保持的指配高度。</td><td>DESCEND TO REACH (level) BY (position)在(位置)之前下降至(高度层)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>192</td><td>指示继续改变高度层,但升降率应保证在指定时间或之前到达指定高度层。</td><td>REACH (level) BY (time)在(时间)之前到达(高度层)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>209</td><td>指示继续改变高度层,但升降率应保证到达指定位置之时或之前到达指定高度层。</td><td>REACH (level) BY (position)在(位置)之前到达(高度层)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>30</td><td>指示在指定的划定垂直范围内保持高度层。</td><td>MAINTAIN BLOCK (level) TO (level)保持高度段(高度层)至(高度层)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>31</td><td>指示开始爬升到划定垂直范围内的高度层。</td><td>CLIMB TO AND MAINTAIN BLOCK (level) TO (level)爬升到高度段(高度层)至(高度层)并保持</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>32</td><td>指示开始下降到划定垂直范围内的高度层。</td><td>DESCEND TO AND MAINTAIN BLOCK (level) TO (level)下降到高度段(高度层)至(高度层)并保持</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>34</td><td>指示开始巡航爬升,并继续上升至指定高度层,到达后须保持在指定高度层。</td><td>CRUISE CLIMB TO (level)巡航爬升到(高度层)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>35</td><td>与有关高度层指令连同使用的指令,表示当高于指定高度层时开始巡航爬升。</td><td>WHEN ABOVE (level)COMMENCE CRUISE CLIMB在(高度层)以上开始巡航爬升</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>219</td><td>指示当到达指定高度时停止爬升,到达后须保持这一高度。指定的高度低于先前指定的高度。</td><td>STOP CLIMB AT (level)在(高度层)停止爬升</td><td>U</td><td>M</td><td>W/U</td></tr><tr><td>220</td><td>指示当到达指定的高度时停止下降,到达后须保持这一高度。指定的高度高于先前指定的高度。</td><td>STOP DESCENT AT (level)在(高度层)停止下降</td><td>U</td><td>M</td><td>W/U</td></tr><tr><td>36</td><td>指示应以航空器最佳爬升率上升至指定高度层。</td><td>EXPEDITE CLIMB TO (level)加速爬升到(高度层)</td><td>U</td><td>M</td><td>W/U</td></tr><tr><td>37</td><td>指示应以航空器最佳下降率下降至指定高度层。</td><td>EXPEDITE DESCENT TO (level)加速下降至(高度层)</td><td>U</td><td>M</td><td>W/U</td></tr><tr><td>38</td><td>紧急指示立即爬升到指定高度层,到达指定高度后须保持这一高度。</td><td>IMMEDIATELY CLIMB TO (level)立即爬升至(高度层)</td><td>D</td><td>H</td><td>W/U</td></tr><tr><td>39</td><td>紧急指示立即下降至指定高度层，到达指定高度后须保持这一高度。</td><td>IMMEDIATELY DESCEND TO (level)立即下降至（高度层）</td><td>D</td><td>H</td><td>W/U</td></tr><tr><td>40</td><td>(预留)</td><td></td><td>L</td><td>L</td><td>Y</td></tr><tr><td>41</td><td>(预留)</td><td></td><td>L</td><td>L</td><td>Y</td></tr><tr><td>171</td><td>指示以不小于指定的速率爬升。</td><td>CLIMB AT (vertical rate) MINIMUM最小以（垂直速率）爬升</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>172</td><td>指示以不大于指定的速率爬升。</td><td>CLIMB AT (vertical rate)MAXIMUM最大以（垂直速率）爬升</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>173</td><td>指示以不小于指定的速率下降。</td><td>DESCEND AT (vertical rate) MINIMUM最小以（垂直速率）下降</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>174</td><td>指示以不大于指定的速率下降。</td><td>DESCEND AT (vertical rate) MAXIMUM最大以（垂直速率）下降</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>33</td><td>(预留)</td><td></td><td>L</td><td>L</td><td>Y</td></tr></table>

注：只要指定了不同的“高度层”，电文即可以指定一个单一的高度层或者一个垂直范围，即高度段。

表 A5-3 穿越限制 (上行)  

<table><tr><td></td><td>电文目的/用途</td><td>电文规定格式</td><td>紧急</td><td>告警</td><td>回答</td></tr><tr><td>42</td><td>(预留)</td><td></td><td>L</td><td>L</td><td>R</td></tr><tr><td>43</td><td>(预留)</td><td></td><td>L</td><td>L</td><td>R</td></tr><tr><td>44</td><td>(预留)</td><td></td><td>L</td><td>L</td><td>R</td></tr><tr><td>45</td><td>(预留)</td><td></td><td>L</td><td>L</td><td>R</td></tr><tr><td>46</td><td>指示在指定的高度层穿越指定位置。该指令可能要求航空器改变其上升或下降剖面。</td><td>CROSS (position) AT (level)在(高度层)穿越(位置)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>47</td><td>指示在指定高度层或以上穿越指定位置。</td><td>CROSS (position) AT OR ABOVE (level)在(高度层)或以上穿越(位置)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>48</td><td>指示在指定高度层或以下穿越指定位置。</td><td>CROSS (position) AT OR BELOW (level)在(高度层)或以下穿越(位置)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>49</td><td>指示在指定的高度层穿越指定位置,并在到达后即保持该高度层。</td><td>CROSS (position) AT AND MAINTAIN (level)在(高度层)穿越(位置)并保持</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>50</td><td>指示在指定的高度层之间的高度层穿越指定位置。</td><td>CROSS (position) BETWEEN (level)AND (level)在(高度层)和(高度层)之间穿越(位置)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>51</td><td>指示在指定的时间穿越指定位置。</td><td>CROSS (position) AT (time)在(时间)穿越(位置)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>52</td><td>指示在指定的时间或之前穿越指定位置。</td><td>CROSS (position) AT OR BEFORE (time)在(时间)或之前穿越(位置)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>53</td><td>指示在指定的时间或之后穿越指定位置。</td><td>CROSS (position) AT OR AFTER (time)在(时间)或之后穿越(位置)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>54</td><td>指示在指定的时刻之间穿越指定位置。</td><td>CROSS (position) BETWEEN (time)AND (time)在(时间)和(时间)之间穿越(位置)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>55</td><td>指示以指定速度穿越指定位置,保持该速度至以后通知。</td><td>CROSS (position) AT (speed)以(速度)穿越(位置)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>56</td><td>指示以指定速度或更小速度穿越指定位置,并保持该速度至以后通知。</td><td>CROSS (position) AT OR LESS THAN (speed)以(速度)或更小速度穿越(位置)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>57</td><td>指示以指定速度或更大速度穿越指定位置,保持该速度至以后通知。</td><td>CROSS (position) AT OR GREATER THAN (speed)以(速度)或更大速度穿越(位置)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>58</td><td>指示于指定的时间,在指定的高度层穿越指定位置。</td><td>CROSS (position) AT (time) AT (level)于(时间)在(高度层)穿越(位置)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>59</td><td>指示于指定的时间或之前,在指定的高度层穿越指定位置。</td><td>CROSS (position) AT OR BEFORE (time) AT (level)于(时间)或之前在(高度层)穿越(位置)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>60</td><td>指示于指定的时间或之后,在指定的高度层穿越指定位置。</td><td>CROSS (position) AT OR AFTER (time) AT (level)于(时间)或之后在(高度层)穿越(位置)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>61</td><td>指示以指定的高度层和速度穿越指定位置,并保持该高度层和速度。</td><td>CROSS (position) AT AND MAINTAIN (level) AT (speed)在(高度层)以(速度)穿越(位置)并保持</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>62</td><td>指示于指定的时间,在指定的高度层穿越指定位置,并保持该高度层。</td><td>AT (time) CROSS (position) AT AND MAINTAIN (level)于(时间)在(高度层)穿越(位置)并保持</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>63</td><td>指示于指定的时间,以指定的高度层和速度穿越指定位置,并保持该高度层和速度。</td><td>AT (time) CROSS (position) AT AND MAINTAIN (level) AT (speed)于(时间)在(高度层)以(速度)穿越(位置)并保持</td><td>N</td><td>M</td><td>W/U</td></tr></table>

注：只要指定了不同的“高度层”，电文即可以指定一个单一的高度层或者一个垂直范围，即高度段。

表 A5-4 横向偏离 (上行)  

<table><tr><td></td><td>电文目的/用途</td><td>电文规定格式</td><td>紧急</td><td>告警</td><td>回答</td></tr><tr><td>64</td><td>指示按指定方向,指定偏航距离,平行于批准航路飞行。</td><td>OFFSET (specified distance)
-direction) OF ROUTE
偏离航路的(方向)(指定距离)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>65</td><td>指示从指定位置开始,按指定方向,指定偏航距离,平行于批准航路飞行。</td><td>AT (position) OFFSET (specified distance) (direction) OF ROUTE
在(位置)偏离航路的(方向)(指定距离)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>66</td><td>指示于指定时间开始,按指定方向,指定偏航距离,平行于批准航路飞行。</td><td>AT (time) OFFSET (specified distance) (direction) OF ROUTE
于(时间)偏离航路的(方向)(指定距离)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>67</td><td>指示重新加入批准航路。</td><td>PROCEED BACK ON ROUTE
返回航路</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>68</td><td>指示在到达指定位置之时或之前重新加入批准航路。</td><td>REJOIN ROUTE BY (position)
在(位置)之前返回航路</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>69</td><td>指示于指定时间或之前重新加入批准航路。</td><td>REJOIN ROUTE BY (time)
在(时间)之前返回航路</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>70</td><td>通知可能发出许可,使航空器能在到达指定位置之时或之前重新加入批准航路。</td><td>EXPECT BACK ON ROUTE BY (position)
预期在(位置)之前返回航路</td><td>L</td><td>L</td><td>R</td></tr><tr><td>71</td><td>通知可能发出许可,使航空器能在指定时间或之前重新加入批准航路。</td><td>EXPECT BACK ON ROUTE
BY (time)
预期在(时间)之前返回航路</td><td>L</td><td>L</td><td>R</td></tr><tr><td>72</td><td>指示在允许的一段飞行或航向之后,恢复自己的航行。可以同如何或在何处重新加入批准航路的指令相连用。</td><td>RESUME OWN NAVIGATION
恢复自己的航行</td><td>N</td><td>M</td><td>W/U</td></tr></table>

表 A5-5 航路改变 (上行)  

<table><tr><td></td><td>电文目的/用途</td><td>电文规定格式</td><td>紧急</td><td>告警</td><td>回答</td></tr><tr><td>73</td><td>从起飞至许可界限之前应遵行的指令。</td><td>(departure clearance)
(起飞许可)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>74</td><td>指示从现在位置直接飞向指定位置。</td><td>PROCEED DIRECT TO (position)
直飞(位置)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>75</td><td>指示在可能时直接飞向指定位置。</td><td>WHEN ABLE PROCEED DIRECT TO (position)
如可能直飞(位置)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>76</td><td>指示于指定时间直接飞向指定位置。</td><td>AT (time) PROCEED DIRECT TO (position) 于 (时间)直飞 (位置)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>77</td><td>指示从指定位置直接飞向下一指定位置。</td><td>AT (position) PROCEED DIRECT TO (position) 在 (位置)直飞 (位置)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>78</td><td>指示在到达指定高度层后,直接飞向指定位置。</td><td>AT (level) PROCEED DIRECT TO (position) 在 (高度层)直飞 (位置)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>79</td><td>指示经由指定航路飞往指定位置。</td><td>CLEARED TO (position) VIA (route clearance) 允许经由(批准航路)飞往(位置)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>80</td><td>指示沿指定航路飞行。</td><td>CLEARED (route clearance) 允许飞 (批准航路)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>81</td><td>指示按照指定的程序飞行。</td><td>CLEARED (procedure name) 允许飞 (程序名称)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>236</td><td>指示飞离管制空域。</td><td>LEAVE CONTROLLED AIRSPACE 飞离管制空域</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>82</td><td>批准偏航至许可航路的指定方向,指定距离。</td><td>CLEARED TO DEVIATE UPTO (specified distance) (direction) OFROUTE 允许偏航至航路的(方向)至(指定距离)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>83</td><td>指示从指定位置飞经指定航路。</td><td>AT (position) CLEARED (route clearance) 允许在 (位置)飞 (批准航路)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>84</td><td>指示从指定位置飞指定的程序。</td><td>AT (position) CLEARED (procedure name) 在 (位置)允许飞 (程序名称)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>85</td><td>通知可能签发在指定航路上飞行的许可。</td><td>EXPECT (route clearance) 预期 (航路许可)</td><td>L</td><td>L</td><td>R</td></tr><tr><td>86</td><td>通知可能签发从指定位置在指定航路飞行的许可。</td><td>AT (position) EXPECT (route clearance) 预期在 (位置)飞 (航路许可)</td><td>L</td><td>L</td><td>R</td></tr><tr><td>87</td><td>通知可能签发直飞指定位置的许可。</td><td>EXPECT DIRECT TO (position) 预期直飞 (位置)</td><td>L</td><td>L</td><td>R</td></tr><tr><td>88</td><td>通知可能签发从第一指定位置直飞下一指定位置的许可。</td><td>AT (position) EXPECT DIRECT TO (position) 预期在 (位置)直飞 (位置)</td><td>L</td><td>L</td><td>R</td></tr><tr><td>89</td><td>通知可能签发于指定时间开始直飞指定位置的许可。</td><td>AT (time) EXPECT DIRECT TO (position) 预期于 (时间)直飞 (位置)</td><td>L</td><td>L</td><td>R</td></tr><tr><td>90</td><td>通知可能签发在到达指定高度层后开始直飞指定位置的许可。</td><td>AT (level) EXPECT DIRECT TO (position) 预期在 (高度层)直飞 (位置)</td><td>L</td><td>L</td><td>R</td></tr><tr><td>91</td><td>指示在指定位置,以指定的高度层加入具有指定特性的等待航线。</td><td>HOLD AT (position) MAINTAIN(level) INBOUND TRACK (degrees)(direction) TURNS (leg type)在(位置)等待保持(高度层)入航航迹(度)(方向)转弯(边的类型)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>92</td><td>指示在指定的位置,以指定的高度层加入具有公布特性的等待空域。</td><td>HOLD AT (position) AS PUBLISHED MAINTAIN (level)在规定(位置)等待保持(高度层)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>93</td><td>通知可能在指定时间签发向前飞行的许可。</td><td>EXPECT FURTHER CLEARANCE AT (time)在(时间)等待下一步许可</td><td>L</td><td>L</td><td>R</td></tr><tr><td>94</td><td>指示按指定方向左转或右转至指定航向。</td><td>TURN (direction) HEADING (degrees)转弯(方向)航向(度)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>95</td><td>指示按指定方向左转或右转至指定航迹。</td><td>TURN (direction) GROUND TRACK (degrees)转弯(方向)航迹(度)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>215</td><td>指示作指定度数的左转弯或右转弯。</td><td>TURN (direction) (degrees) DEGREES转弯(方向)(度)度</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>190</td><td>指示按指定航向飞行。</td><td>FLY HEADING (degrees)飞行航向(度)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>96</td><td>指示继续按现在航向飞行。</td><td>CONTINUE PRESENT HEADING继续飞现在航向</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>97</td><td>指示从指定位置飞指定航向。</td><td>AT (position) FLY HEADING (degrees)从(位置)飞航向(度)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>221</td><td>指示在转至先前指配的航向前,在指定航向停止转弯。</td><td>STOP TURN HEADING (degrees)在航向(度)停止转弯</td><td>U</td><td>M</td><td>W/U</td></tr><tr><td>98</td><td>指示立即按规定左转或右转至指定航向。</td><td>IMMEDIATELY TURN (direction)HEADING (degrees)立即(方向)转弯航向(度)</td><td>D</td><td>H</td><td>W/U</td></tr><tr><td>99</td><td>通知可能为航空器签发飞指定程序的许可。</td><td>EXPECT (procedure name)预期飞(程序名称)</td><td>L</td><td>L</td><td>R</td></tr></table>

注：只要指定了不同的“高度层”，电文即可以指定一个单一的高度层或者一个垂直范围，即高度段。

表 A5-6 速度变化 (上行)  

<table><tr><td></td><td>电文目的/用途</td><td>电文规定格式</td><td>紧急</td><td>告警</td><td>回答</td></tr><tr><td>100</td><td>通知可能签发于指定时间生效的速度指令。</td><td>AT (time) EXPECT (speed)
在 (时间) 预期 (速度)</td><td>L</td><td>L</td><td>R</td></tr><tr><td>101</td><td>通知可能签发在指定位置生效的速度指令。</td><td>AT (position) EXPECT (speed)
在 (位置) 预期 (速度)</td><td>L</td><td>L</td><td>R</td></tr><tr><td>102</td><td>通知可能签发在指定高度层生效的速度指令。</td><td>AT(level) EXCEPT (speed)在(高度层)预期(速度)</td><td>L</td><td>L</td><td>R</td></tr><tr><td>103</td><td>通知可能签发于指定时间生效的速度范围指令。</td><td>AT(time) EXCEPT (speed) TO (speed)在(时间)预期(速度)至(速度)</td><td>L</td><td>L</td><td>R</td></tr><tr><td>104</td><td>通知可能签发在指定位置生效的速度范围指令。</td><td>AT (position) EXCEPT (speed) TO (speed)在(位置)预期(速度)至(速度)</td><td>L</td><td>L</td><td>R</td></tr><tr><td>105</td><td>通知可能签发在指定高度层生效的速度范围指令。</td><td>AT (level) EXCEPT (speed) TO (speed)在(高度层)预期(速度)至(速度)</td><td>L</td><td>L</td><td>R</td></tr><tr><td>106</td><td>指示保持指定速度。</td><td>MAINTAIN (speed)保持(速度)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>188</td><td>指示通过指定位置之后保持指定速度。</td><td>AFTER PASSING (position) MAINTAIN (speed)通过(位置)后保持(速度)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>107</td><td>指示保持现在速度。</td><td>MAINTAIN PRESENT SPEED 保持现在速度</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>108</td><td>指示保持指定速度或更大速度。</td><td>MAINTAIN (speed) OR GREATER 保持(速度)或更大速度</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>109</td><td>指示保持指定速度或更小速度。</td><td>MAINTAIN (speed) OR LESS 保持(速度)或更小速度</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>110</td><td>指示保持指定速度范围内的速度。</td><td>MAINTAIN (speed) TO (speed)保持(速度)至(速度)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>111</td><td>指示将现在速度加速至指定速度,并保持至进一步通知。</td><td>INCREASE SPEED TO (speed) 加速至(速度)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>112</td><td>指示将现在速度加速至指定速度或更大速度,并保持该速度或更大速度至进一步通知。</td><td>INCREASE SPEED TO (speed) OR GREATER 加速至(速度)或更大速度</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>113</td><td>指示将现在速度减慢至指定速度,并保持至进一步通知。</td><td>REDUCE SPEED TO (speed) 减速至(速度)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>114</td><td>指示将现在速度减至指定速度或更小速度,并保持该速度或更小速度至进一步通知。</td><td>REDUCE SPEED TO (speed) OR LESS 减速至(速度)或更小速度</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>115</td><td>指示不得超过指定速度。</td><td>DO NOT EXCEED (speed) 不得超过(速度)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>116</td><td>指示航空器恢复正常速度。先前发布的速度限制被取消。</td><td>RESUME NORMAL SPEED 恢复正常速度</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>189</td><td>指示将现在速度调整至指定速度。</td><td>ADJUST SPEED TO (speed) 调整速度至(速度)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>222</td><td>通知航空器可以不受限制保持其希望的速度。</td><td>NO SPEED RESTRICTION无速度限制</td><td>L</td><td>L</td><td>R</td></tr><tr><td>223</td><td>指示减慢现行速度至最低安全近速度。</td><td>REDUCE TO MINIMUMAPPROACH SPEED减至最低进近速度</td><td>N</td><td>M</td><td>W/U</td></tr></table>

注：只要指定了不同的“高度层”，电文即可以指定一个单一的高度层或者一个垂直范围，即高度段。

表 A5-7 联络/监测/监视请求 (上行)  

<table><tr><td></td><td>电文目的/用途</td><td>电文规定格式</td><td>紧急</td><td>告警</td><td>回答</td></tr><tr><td>117</td><td>指示在指定频率上联络有指定的ATS单位名称的ATS单位。</td><td>CONTACT (unit name) (frequency)联络(单位名称)(频率)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>118</td><td>指示在指定位置,在指定频率上联络有指定的 ATS 单位名称的ATS单位。</td><td>AT (position) CONTACT (unit name)(frequency)在(位置)联络(单位名称)(频率)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>119</td><td>指示于指定时间,在指定频率上联络有指定的 ATS 单位名称的 ATS 单位。</td><td>AT (time) CONTACT (unit name)(frequency)于(时间)联络(单位名称)(频率)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>238</td><td>通知经指定的二次频率</td><td>SECONDARYFREQUENCY (frequency)二次频率(频率)</td><td>N</td><td>L</td><td>R</td></tr><tr><td>120</td><td>指示在指定频率上监测有指定的ATS单位名称的ATS单位。</td><td>MONITOR (unit name) (frequency)监测(单位名称)(频率)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>121</td><td>指示在指定位置,在指定频率上监测有指定的 ATS 单位名称的 ATS单位。</td><td>AT (position) MONITOR (unit name)(frequency)在(位置)监测(单位名称)(频率)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>122</td><td>指示于指定时间,在指定频率上监测有指定的 ATS 单位名称的 ATS单位。</td><td>AT (time) MONITOR (unitname)(frequency)于(时间)监测(单位名称)(频率)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>123</td><td>指示选用指配的 SSR 编码。</td><td>SQUAWK (code)打开应答机(编码)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>124</td><td>指示停用 SSR 应答机。</td><td>STOP SQUAWK关闭应答机</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>239</td><td>指示终止拍发 ADS-B</td><td>STOP ADS-B TRANSMISSION停止拍发 ADS-B</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>125</td><td>指示 SSR 应答机应答内容应包括高度层信息。</td><td>SQUAWK MODE CHARLIE使用应答模式C</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>240</td><td>指示 ADS-B 发报应包括高度情报。</td><td>TRANSMIT ADS-B ALTITUDE发送 ADS-B 高度</td><td>N</td><td>M</td><td>W/U</td></tr></table>

表 A5-8 报告/证实请求 (上行)  

<table><tr><td></td><td>电文目的/用途</td><td>电文规定格式</td><td>紧急</td><td>告警</td><td>回答</td></tr><tr><td>126</td><td>指示 SSR 应答机应答内容不再需要包括高度层信息。</td><td>STOP SQUAWK MODE CHARLIE停用应答模式C</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>241</td><td>指示 ADS-B 发报不再包括高度情报。</td><td>STOP ADS-B ALTITUDE TRANSMISSION关闭 ADS-B 高度发送</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>179</td><td>指示使用 SSR 应答机识别功能。</td><td>SQUAWK IDENT打开应答识别</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>242</td><td>指示启用 ADS-B 发射机“识别”功能</td><td>TRANMIT ADS-B IDENT发送 ADS-B 识别</td><td>N</td><td>M</td><td>W/U</td></tr></table>

<table><tr><td></td><td>电文目的/用途</td><td>电文规定格式</td><td>紧急</td><td>告警</td><td>回答</td></tr><tr><td>243</td><td>指示航空器离开恶劣气象条件并回到批准的飞行航路的许可能够接受时报告。</td><td>REPORT CLEAR OF WEATHER报告天气晴朗</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>127</td><td>指示航空器在回到批准航路时报告。</td><td>REPORT BACK ON ROUTE报告回到航路</td><td>N</td><td>L</td><td>W/U</td></tr><tr><td>128</td><td>指示航空器在退出保持或在爬升或下降时穿越的指定高度层时报告。</td><td>REPORT LEAVING (level)报告离开(高度层)</td><td>N</td><td>L</td><td>W/U</td></tr><tr><td>129</td><td>指示航空器在指定高度层保持平飞时报告。</td><td>REPORT MAINTAINING (level)报告保持(高度层)</td><td>N</td><td>L</td><td>W/U</td></tr><tr><td>175</td><td>(预留)</td><td></td><td>N</td><td>L</td><td>W/U</td></tr><tr><td>200</td><td>指示报告保持指定高度层,与高度层许可连用。</td><td>REPORT REACHING报告保持</td><td>N</td><td>L</td><td>W/U</td></tr><tr><td>180</td><td>指示航空器在指定垂直范围内时报告。</td><td>REPORT REACHING BLOCK (level)TO (level)报告到达高度段(高度层)至(高度层)</td><td>N</td><td>L</td><td>W/U</td></tr><tr><td>130</td><td>指示航空器通过指定位置后报告。</td><td>REPORT PASSING (position)报告通过(位置)</td><td>N</td><td>L</td><td>W/U</td></tr><tr><td>181</td><td>指示报告距/自指定位置的现在距离。</td><td>REPORT DISTANCE (to/from) (position)报告(距/自)(位置)的距离</td><td>N</td><td>M</td><td>Y</td></tr><tr><td>184</td><td>指示于指定时间报告距/自指定位置的距离。</td><td>AT (time) REPORT DISTANCE(to/from) (position)于(时间)报告(距/自)(位置)的距离</td><td>N</td><td>L</td><td>Y</td></tr><tr><td>228</td><td>指示报告预计到达指定位置的时间。</td><td>REPORT ETA (position)报告ETA(位置)</td><td>L</td><td>L</td><td>Y</td></tr><tr><td>131</td><td>指示报告剩余油量和机上人数。</td><td>REPORT REMAINING FUEL AND PERSONS ON BOARD 报告剩余油量和机上人数</td><td>U</td><td>M</td><td>Y</td></tr><tr><td>132</td><td>指示报告现在位置。</td><td>REPORT POSITION 报告位置</td><td>N</td><td>M</td><td>Y</td></tr><tr><td>133</td><td>指示报告现在高度。</td><td>REPORT PRESENT LEVEL 报告现在高度层</td><td>N</td><td>M</td><td>Y</td></tr><tr><td>134</td><td>指示报告要求的速度。</td><td>REPORT (speed type) (speed type) (speed type) SPEED 报告(速度类型)(速度类型)(速度类型)速度</td><td>N</td><td>M</td><td>Y</td></tr><tr><td>135</td><td>指示证实现用指配高度层。</td><td>CONFIRM ASSIGNATED LEVEL 证实现用指配高度层</td><td>N</td><td>L</td><td>Y</td></tr><tr><td>136</td><td>指示证实现用指定速度。</td><td>CONFIRM ASSIGNATED SPEED 证实现用指定速度</td><td>N</td><td>L</td><td>Y</td></tr><tr><td>137</td><td>指示证实现飞指定航路。</td><td>CONFIRM ASSIGNATED ROUTE 证实指定航路</td><td>N</td><td>L</td><td>Y</td></tr><tr><td>138</td><td>指示证实先前报告的飞越上一航路点的时间。</td><td>CONFIRM TIME OVER REPORTED WAYPOINT 证实飞越已报航路点的时间</td><td>N</td><td>L</td><td>Y</td></tr><tr><td>139</td><td>指示证实先前报告的航路点名称。</td><td>CONFIRM REPORTED WAYPOINT 证实报告的航路点</td><td>N</td><td>L</td><td>Y</td></tr><tr><td>140</td><td>指示证实下一航路点的名称。</td><td>CONFIRM NEXT WAYPOINT 证实下一航路点</td><td>N</td><td>L</td><td>Y</td></tr><tr><td>141</td><td>指示证实先前报告的预计到达下一航路点的时间。</td><td>CONFIRM NEXT WAYPOINT ETA 证实下一航路点的ETA</td><td>N</td><td>L</td><td>Y</td></tr><tr><td>142</td><td>指示证实再下一个航路点的名称。</td><td>CONFIRM ENSUING WAYPOINT 证实再下一个航路点</td><td>N</td><td>L</td><td>Y</td></tr><tr><td>143</td><td>不明白请求,应予以澄清并重新申请。</td><td>CONFIRM REQUEST 证实请求</td><td>N</td><td>L</td><td>Y</td></tr><tr><td>144</td><td>指示报告选用的SSR编码。</td><td>CONFIRM SQUAWK 证实应答机编码</td><td>N</td><td>L</td><td>Y</td></tr><tr><td>145</td><td>指示报告现飞航向。</td><td>REPORT HEADING 报告航向</td><td>N</td><td>M</td><td>Y</td></tr><tr><td>146</td><td>指示报告现在地面航迹。</td><td>REPORT GROUND TRACK 报告航迹</td><td>N</td><td>M</td><td>Y</td></tr><tr><td>182</td><td>指示报告收到的最后一个ATIS 的识别代码。</td><td>CONFIRM ATIS CODE 证实ATIS代码</td><td>N</td><td>L</td><td>Y</td></tr><tr><td>147</td><td>指示作位置报告。</td><td>REQUEST POSITION REPORT 请发位置报告</td><td>N</td><td>M</td><td>Y</td></tr><tr><td>216</td><td>指示提出飞行计划。</td><td>REQUEST FLIGHT PLAN
请发飞行计划</td><td>N</td><td>M</td><td>Y</td></tr><tr><td>217</td><td>指示报告航空器已降落。</td><td>REPORT ARRIVAL
报告到达</td><td>N</td><td>M</td><td>Y</td></tr><tr><td>229</td><td>指示报告愿往降落的备降场。</td><td>REPORT ALTERNATE AERODROME
报告备降场</td><td>L</td><td>L</td><td>Y</td></tr><tr><td>231</td><td>指示说明飞行员愿飞的高度层。</td><td>STATE PREFERRED LEVEL
说明愿飞的高度层</td><td>L</td><td>L</td><td>Y</td></tr><tr><td>232</td><td>指示说明飞行员希望开始向预计降落机场下降的时间和/或位置。</td><td>STATE TOP OF DESCENT
说明下降起始点</td><td>L</td><td>L</td><td>Y</td></tr></table>

注：只要指定了不同的“高度层”，电文即可以指定一个单一的高度层或者一个垂直范围，即高度段。

表 A5-9 询问请求 (上行)  

<table><tr><td></td><td>电文目的/用途</td><td>电文规定格式</td><td>紧急</td><td>告警</td><td>回答</td></tr><tr><td>148</td><td>请告能够接受指定高度层的最早时间或位置。</td><td>WHEN CAN YOU ACCEPT (level)你何时能够接受(高度层)</td><td>N</td><td>L</td><td>Y</td></tr><tr><td>149</td><td>指示报告能否在指定位置接受指定高度层。</td><td>CAN YOU ACCEPT (level) AT (position)你能否在(位置)接受(高度层)</td><td>N</td><td>L</td><td>A/N</td></tr><tr><td>150</td><td>指示报告能否在指定时间接受指定高度层。</td><td>CAN YOU ACCEPT (level) AT (time)你能否于(时间)接受(高度层)</td><td>N</td><td>L</td><td>A/N</td></tr><tr><td>151</td><td>指示报告可以接受指定速度的最早时间或位置。</td><td>WHEN CAN YOU ACCEPT (speed)你何时能接受(速度)</td><td>N</td><td>L</td><td>Y</td></tr><tr><td>152</td><td>指示报告可以接受指定偏航航迹的最早时间或位置。</td><td>WHEN CAN YOU ACCEPT (specified distance) (direction) OFFSET你何时能接受偏航(方向)(指定距离)</td><td>N</td><td>L</td><td>Y</td></tr></table>

注：只要指定了不同的“高度层”，电文即可以指定一个单一的高度层或者一个垂直范围，即高度段。

表 A5-10 空中交通咨询 (上行)  

<table><tr><td></td><td>电文目的/用途</td><td>电文规定格式</td><td>紧急</td><td>告警</td><td>回答</td></tr><tr><td>153</td><td>ATS 咨询信息：高度表应按指定值拨正。</td><td>ALTIMETER (altimeter)高度表拨正（高度表拨正值）</td><td>N</td><td>L</td><td>R</td></tr><tr><td>213</td><td>ATS 咨询信息：指定高度表拨正值与指定设施相关。</td><td>(facility designation) ALTIMETER (altimeter)(设施代号) 高度表拨正（高度表拨正值）</td><td>N</td><td>L</td><td>R</td></tr></table>

表 A5-11 系统管理电文 (上行)  

<table><tr><td></td><td>电文目的/用途</td><td>电文规定格式</td><td>紧急</td><td>告警</td><td>回答</td></tr><tr><td>154</td><td>ATS 咨询信息:雷达服务现已终止。</td><td>RADAR SERVICE TERMINATED雷达服务已终止</td><td>N</td><td>L</td><td>R</td></tr><tr><td>244</td><td>ATS 咨询信息:雷达和/或ADS-B服务现已终止。</td><td>IDENTIFICATION TERMINATED识别终止</td><td>N</td><td>L</td><td>R</td></tr><tr><td>191</td><td>ATS 咨询信息:航空器正进入不提供ATS 服务的空域,所有ATS 服务均已终止。</td><td>ALL ATS TERMINATED所有ATS 服务均已终止</td><td>N</td><td>M</td><td>R</td></tr><tr><td>155</td><td>ATS 咨询信息:已在指定位置建立雷达联系。</td><td>RADAR CONTACT (position)雷达联系(位置)</td><td>N</td><td>M</td><td>R</td></tr><tr><td>156</td><td>ATS 咨询信息:现已失去雷达联系。</td><td>RADAR CONTACT LOST雷达联系中断</td><td>N</td><td>M</td><td>R</td></tr><tr><td>210</td><td>ATS 咨询信息:在雷达和/或ADS-B上识别出航空器在指定位置。</td><td>IDENTIFIED (position)已识别(位置)</td><td>N</td><td>M</td><td>R</td></tr><tr><td>193</td><td>通知现失去雷达和/或ADS-B识别。</td><td>IDENTIFICATION LOST失去识别</td><td>N</td><td>M</td><td>R</td></tr><tr><td>157</td><td>通知发现在指定频率上有连续发射,检查话筒按钮。</td><td>CHECK STUCK MICROPHONE(frequency)检查插入话筒(频率)</td><td>U</td><td>M</td><td>N</td></tr><tr><td>158</td><td>ATS 咨询信息:以指定代码为标识的ATIS 情报为现行情报。</td><td>ATIS (atis code)ATIS (atis 代码)</td><td>N</td><td>L</td><td>R</td></tr><tr><td>212</td><td>ATS 咨询信息:指定机场的指定ATIS 情报为现行情报。</td><td>(facility designation) ATIS(atis code) CURRENT(机场代号) ATIS (atis 代码)为现行情报</td><td>N</td><td>L</td><td>R</td></tr><tr><td>214</td><td>ATS 咨询信息:表示指定跑道的RVR值。</td><td>RVR RUNWAY (runway) (rvr)RVR 跑道 (跑道) (rvr)</td><td>N</td><td>M</td><td>R</td></tr><tr><td>224</td><td>ATS 咨询信息:预计不会出现延误。</td><td>NO DELAY EXPECTED预计不会出现延误</td><td>N</td><td>L</td><td>R</td></tr><tr><td>225</td><td>ATS 咨询信息:预期延误尚未确定。</td><td>DELAY NOT DETERMINED延误未定</td><td>N</td><td>L</td><td>R</td></tr><tr><td>226</td><td>ATS 咨询信息:航空器预计许可于指定时间开始其进近。</td><td>EXPECTED APPROACH TIME (time)预计进近时间(时间)</td><td>N</td><td>L</td><td>R</td></tr></table>

<table><tr><td></td><td>电文目的/用途</td><td>电文规定格式</td><td>紧急</td><td>告警</td><td>回答</td></tr><tr><td>159</td><td>系统电文通知地面检测发现错误。</td><td>ERROR (error information)错误（错误信息）</td><td>U</td><td>M</td><td>N</td></tr></table>

表 A5--12 间距电文 (上行)  

<table><tr><td></td><td>电文目的/用途</td><td>电文规定格式</td><td>紧急</td><td>告警</td><td>回答</td></tr><tr><td>160</td><td>通知航空电子设备,指定单位为下一数据负责单位。如果未指定数据负责单位表示任何以前指定的下一数据负责单位不再有效。</td><td>NEXT DATA AUTHORITY (facility)下一数据负责单位(负责单位)</td><td>L</td><td>N</td><td>N</td></tr><tr><td>161</td><td>通知航空电子设备,与当前数据负责单位的数据链通信正在终止。</td><td>END SERVICE终止服务</td><td>L</td><td>N</td><td>N</td></tr><tr><td>162</td><td>通知地面系统不支持该电文。</td><td>MESSAGE NOT SUPPORTED BY THIS ATS UNIT本ATS单位不支持这份电报</td><td>L</td><td>L</td><td>N</td></tr><tr><td>234</td><td>通知地面系统无该航空器飞行计划。</td><td>FLIGHT PLAN NOT HELD没有飞行计划</td><td>L</td><td>L</td><td>N</td></tr><tr><td>163</td><td>通知飞行员ATSU标识。</td><td>(facility designation)(负责单位代号)</td><td>L</td><td>N</td><td>N</td></tr><tr><td>227</td><td>向机上系统证实,地面系统收到逻辑认收电文,并认为此电文可接受以传送给负责人。</td><td>LOGICAL ACKNOWLEDGEMENT逻辑认收</td><td>N</td><td>M</td><td>N</td></tr><tr><td>233</td><td>通知飞行员,本地面系统不接受发送的逻辑认收电文。</td><td>USE OF LOGICAL ACKNOWLEDGEMENT PROHIBITED禁用逻辑承认</td><td>N</td><td>M</td><td>N</td></tr></table>

<table><tr><td>编号</td><td>电文目的/用途</td><td>电文规定格式</td><td>紧急</td><td>告警</td><td>回答</td></tr><tr><td>*</td><td>参照航空器后方有高度层更换程序航空器时,空中交通服务确认驾驶员使用高度层更换程序。此电文总是连接一个垂直许可。</td><td>ITP BEHIND (aircraft identification of reference aircraft) (参照航空器的航空器识别代码)后方有高度层更换程序</td><td>N</td><td>L</td><td>R</td></tr><tr><td>*</td><td>参照航空器前方有高度层更换程序航空器时,空中交通服务确认驾驶员使用高度层更换程序。此电文总是连接一个垂直许可。</td><td>ITP AHEAD OF (aircraft identification of reference aircraft) (参照航空器的航空器识别代码)前方有高度层更换程序</td><td>N</td><td>L</td><td>R</td></tr><tr><td>*</td><td>当两架参照航空器后方有高度层更换程序航空器时,空中交通服务确认驾驶员使用高度层更换程序。此电文总是连接一个垂直许可。</td><td>ITP BEHIND (aircraft identification of reference aircraft) AND BEHIND (aircraft identification of reference aircraft) (参照航空器的航空器识别代码)后方和(参照航空器的航空器识别代码)后方有高度层更换程序</td><td>N</td><td>L</td><td>R</td></tr></table>

表 A5-13 其他电文 (上行)  

<table><tr><td>编号</td><td>电文目的/用途</td><td>电文规定格式</td><td>紧急</td><td>告警</td><td>回答</td></tr><tr><td>*</td><td>当两架参照航空器前方有高度层更换程序航空器时,空中交通服务确认驾驶员使用高度层更换程序。此电文总是连接一个垂直许可。</td><td>ITP AHEAD OF (aircraft identification of reference aircraft) AND AHEAD OF (aircraft identification of reference aircraft) (参照航空器的航空器识别代码)前方和(参照航空器的航空器识别代码)前方有高度层更换程序</td><td>N</td><td>L</td><td>R</td></tr><tr><td>*</td><td>当一架高度层更换程序航空器位于一架参照航空器之后,但在另一架参照航空器之前,空中交通服务确认驾驶员使用高度层更换程序。此电文总是连接一个垂直许可。</td><td>ITP BEHIND (aircraft identification of reference aircraft) AND AHEAD OF (aircraft identification of reference aircraft) (参照航空器的航空器识别代码)后方和(参照航空器的航空器识别)前方有高度层更换程序</td><td>N</td><td>L</td><td>R</td></tr><tr><td colspan="6">*使用UM169按照自由格式发送这些电文。</td></tr></table>

<table><tr><td></td><td>电文目的/用途</td><td>电文规定格式</td><td>紧急</td><td>告警</td><td>回答</td></tr><tr><td>164</td><td>有关指示可在以后任何时间执行。</td><td>WHEN READY
当准备好时</td><td>L</td><td>N</td><td>N</td></tr><tr><td>230</td><td>有关指示应立即执行。</td><td>IMMEDIATELY
立即</td><td>D</td><td>H</td><td>N</td></tr><tr><td>165</td><td>用于连接两份电文，说明许可或指令的正当实施顺序。</td><td>THEN
然后</td><td>L</td><td>N</td><td>N</td></tr><tr><td>166</td><td>由于交通原因发出有关指令。</td><td>DUE TO (traffic type) TRAFFIC
由于（飞行种类）飞行</td><td>L</td><td>N</td><td>N</td></tr><tr><td>167</td><td>由于空域限制发出有关指令。</td><td>DUE TO AIRSPACE RESTRICTION
由于空域限制</td><td>L</td><td>N</td><td>N</td></tr><tr><td>168</td><td>所指明的电文无需处理。</td><td>DISREGARD
无需处理</td><td>U</td><td>M</td><td>R</td></tr><tr><td>176</td><td>指示飞行员负责保持与其他航空器的间隔，同时负责保持目视气象条件。</td><td>MAINTAIN OWN SEPARATION
AND VMC
自行保持间隔和目视气象条件</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>177</td><td>用于与许可或指令连用，表示飞行员打算执行时可以执行。</td><td>AT PILOTSDISCRETION
由飞行员决定</td><td>L</td><td>L</td><td>N</td></tr><tr><td>178</td><td>(预留)</td><td></td><td>L</td><td>L</td><td>Y</td></tr><tr><td>169</td><td></td><td>(free text)
(非固定格式电文)</td><td>N</td><td>L</td><td>R</td></tr><tr><td>170</td><td></td><td>(free text)
(非固定格式电文)</td><td>D</td><td>H</td><td>R</td></tr><tr><td>183</td><td></td><td>(free text)
(非固定格式电文)</td><td>M</td><td>N</td><td>M</td></tr><tr><td>187</td><td></td><td>(free text)
(非固定格式电文)</td><td>L</td><td>N</td><td>N</td></tr><tr><td>194</td><td></td><td>(free text)
(非固定格式电文)</td><td>N</td><td>L</td><td>Y</td></tr><tr><td>195</td><td></td><td>(free text)
(非固定格式电文)</td><td>L</td><td>L</td><td>R</td></tr><tr><td>196</td><td></td><td>(free text)
(非固定格式电文)</td><td>N</td><td>M</td><td>W/U</td></tr><tr><td>197</td><td></td><td>(free text)
(非固定格式电文)</td><td>U</td><td>M</td><td>W/U</td></tr><tr><td>198</td><td></td><td>(free text)
(非固定格式电文)</td><td>D</td><td>H</td><td>W/U</td></tr><tr><td>199</td><td></td><td>(free text)
(非固定格式电文)</td><td>N</td><td>L</td><td>N</td></tr><tr><td>201</td><td>不使用</td><td></td><td>L</td><td>L</td><td>N</td></tr><tr><td>202</td><td>不使用</td><td></td><td>L</td><td>L</td><td>N</td></tr><tr><td>203</td><td></td><td>(free text)
(非固定格式电文)</td><td>N</td><td>M</td><td>R</td></tr><tr><td>204</td><td></td><td>(free text)
(非固定格式电文)</td><td>N</td><td>M</td><td>Y</td></tr><tr><td>205</td><td></td><td>(free text)
(非固定格式电文)</td><td>N</td><td>M</td><td>A/N</td></tr><tr><td>206</td><td></td><td>(free text)
(非固定格式电文)</td><td>L</td><td>N</td><td>Y</td></tr><tr><td>207</td><td></td><td>(free text)
(非固定格式电文)</td><td>L</td><td>L</td><td>Y</td></tr><tr><td>208</td><td></td><td>(free text)
(非固定格式电文)</td><td>L</td><td>L</td><td>N</td></tr></table>

注：非固定格式电文不与电文的目的相联系。应用已在电文集中使用的任何属性组合来发送非固定格式电文的能力，已在航空电信网 (ATN) 的技术要求中规定 (附件 10 第三卷，第一部分，第三章)。

# 2. 下行电文

表 A5-14 回答 (下行)  

<table><tr><td></td><td>电文目的/用途</td><td>电文规定格式</td><td>紧急</td><td>告警</td><td>回答</td></tr><tr><td>0</td><td>明白指令，照办。</td><td>WILCO
照办</td><td>N</td><td>M</td><td>N</td></tr><tr><td>1</td><td>不能照办。</td><td>UNABLE
不能</td><td>N</td><td>M</td><td>N</td></tr><tr><td>2</td><td>等待答复。</td><td>STANDBY
等候</td><td>N</td><td>M</td><td>N</td></tr><tr><td>3</td><td>收到电文，明白意思。</td><td>ROGER
明白</td><td>N</td><td>M</td><td>N</td></tr><tr><td>4</td><td>是、对</td><td>AFFIRM
是、对</td><td>N</td><td>M</td><td>N</td></tr><tr><td>5</td><td>不是、不对</td><td>NEGATIVE
不是、不对</td><td>N</td><td>M</td><td>N</td></tr></table>

表 A5-15 垂直请求 (下行)  

<table><tr><td></td><td>电文目的/用途</td><td>电文规定格式</td><td>紧急</td><td>告警</td><td>回答</td></tr><tr><td>6</td><td>请求在指定高度层飞行。</td><td>REQUEST (level)
请求(高度层)</td><td>N</td><td>L</td><td>Y</td></tr><tr><td>7</td><td>请求在指定垂直范围内的高度层飞行。</td><td>REQUEST BLOCK (level) TO (level)
请求高度段(高度层)至(高度层)</td><td>N</td><td>L</td><td>Y</td></tr><tr><td>8</td><td>请求巡航爬升至指定高度层。</td><td>REQUEST CRUISE CLIMB TO (level)
请求巡航爬升至(高度层)</td><td>N</td><td>L</td><td>Y</td></tr><tr><td>9</td><td>请求爬升至指定高度层。</td><td>REQUEST CLIMB TO (level)
请求爬升至(高度层)</td><td>N</td><td>L</td><td>Y</td></tr><tr><td>10</td><td>请求下降至指定高度层。</td><td>REQUEST DESCENT TO (level)
请求下降至(高度层)</td><td>N</td><td>L</td><td>Y</td></tr><tr><td>11</td><td>请求批准在指定位置爬升至指定高度层。</td><td>AT (position) REQUEST CLIMB TO (level)
请求在(位置)爬升至(高度层)</td><td>N</td><td>L</td><td>Y</td></tr><tr><td>12</td><td>请求批准在指定位置下降至指定高度层。</td><td>AT (position) REQUEST DESCENT TO (level)
请求在(位置)下降至(高度层)</td><td>N</td><td>L</td><td>Y</td></tr><tr><td>13</td><td>请求批准于指定时间爬升至指定高度层。</td><td>AT (time) REQUEST CLIMB TO (level)
请求于(时间)爬升至(高度层)</td><td>N</td><td>L</td><td>Y</td></tr><tr><td>14</td><td>请求批准于指定时间下降至指定高度层。</td><td>AT (time) REQUEST DESCENT TO (level)
请求于 (时间) 下降至 (高度层)</td><td>N</td><td>L</td><td>Y</td></tr><tr><td>69</td><td>请求批准按目视避让下降。</td><td>REQUEST VMC DESCENT
请求 VMC 下降</td><td>N</td><td>L</td><td>Y</td></tr></table>

注：只要指定了不同的“高度层”，电文即可以指定一个单一的高度层或者一个垂直范围，即高度段。

表 A5-16 横向偏离请求 (下行)  

<table><tr><td></td><td>电文目的/用途</td><td>电文规定格式</td><td>紧急</td><td>告警</td><td>回答</td></tr><tr><td>15</td><td>请求批准按指定方向的指定距离,以平行航迹偏离批准航路。</td><td>REQUEST OFFSET (specified distance) (direction) OF ROUTE 请求偏离航路的(方向)(指定距离)</td><td>N</td><td>L</td><td>Y</td></tr><tr><td>16</td><td>请求批准从指定位置,按指定方向的指定距离,以平行航迹偏离批准航路。</td><td>AT (position) REQUEST OFFSET (specified distance) (direction) OF ROUTE 请求在(位置)偏离航路的(方向)(指定距离)</td><td>N</td><td>L</td><td>Y</td></tr><tr><td>17</td><td>请求批准于指定时间,按指定方向的指定距离,以平行航迹偏离批准航路。</td><td>AT (time) REQUEST OFFSET (specified distance) (direction) OF ROUTE 请求于(时间)偏离航路的(方向)(指定距离)</td><td>N</td><td>L</td><td>Y</td></tr></table>

表 A5-17 速度请求 (下行)  

<table><tr><td></td><td>电文目的/用途</td><td>电文规定格式</td><td>紧急</td><td>告警</td><td>回答</td></tr><tr><td>18</td><td>请求以指定速度飞行。</td><td>REQUEST (speed)
请求 (速度)</td><td>N</td><td>L</td><td>Y</td></tr><tr><td>19</td><td>请求在指定速度范围内飞行。</td><td>REQUEST (speed) TO (speed)
请求 (速度) 至 (速度)</td><td>N</td><td>L</td><td>Y</td></tr></table>

表 A5-18 话音联络请求 (下行)  

<table><tr><td></td><td>电文目的/用途</td><td>电文规定格式</td><td>紧急</td><td>告警</td><td>回答</td></tr><tr><td>20</td><td>请求话音联络。</td><td>REQUEST VOICE CONTACT
请求话音联络</td><td>N</td><td>L</td><td>Y</td></tr><tr><td>21</td><td>请求在指定频率用话音联络。</td><td>REQUEST VOICE CONTACT (frequency)
请求话音联络（频率）</td><td>N</td><td>L</td><td>Y</td></tr></table>

表 A5-19 航路改变请求 (下行)  

<table><tr><td></td><td>电文目的/用途</td><td>电文规定格式</td><td>紧急</td><td>告警</td><td>回答</td></tr><tr><td>22</td><td>请求从现在位置直飞指定位置。</td><td>REQUEST DIRECT TO (position)请求直飞(位置)</td><td>N</td><td>L</td><td>Y</td></tr><tr><td>23</td><td>请求指定程序的许可。</td><td>REQUEST (procedure name)请求(程序名称)</td><td>N</td><td>L</td><td>Y</td></tr><tr><td>24</td><td>请求航路许可。</td><td>REQUEST CLEARANCE (route clearance)请求批准(航路许可)</td><td>N</td><td>L</td><td>Y</td></tr><tr><td>25</td><td>请求一种许可。</td><td>REQUEST (clearance type)CLEARANCE请求(许可类型)许可</td><td>N</td><td>L</td><td>Y</td></tr><tr><td>26</td><td>请求因天气改航经指定航路至指定位置。</td><td>REQUEST WEATHER DEVIATION TO (position) VIA (route clearance)请求因天气改飞(位置)经(批准航路)</td><td>N</td><td>M</td><td>Y</td></tr><tr><td>27</td><td>请求因天气偏航至航迹的指定方向,指定距离。</td><td>REQUEST WEATHER DEVIATION UP TO (specified distance) (direction) OF ROUTE请求因天气偏航至航路的(方向)(指定距离)</td><td>N</td><td>M</td><td>Y</td></tr><tr><td>70</td><td>请求许可用指定航向飞行。</td><td>REQUEST HEADING (degrees)请求航向(度数)</td><td>N</td><td>L</td><td>Y</td></tr><tr><td>71</td><td>请求许可用指定地面航迹飞行。</td><td>REQUEST GROUND TRACK (degrees)请求航迹(度数)</td><td>N</td><td>L</td><td>Y</td></tr></table>

表 A5-20 报告 (下行)  

<table><tr><td></td><td>电文目的/用途</td><td>电文规定格式</td><td>紧急</td><td>告警</td><td>回答</td></tr><tr><td>28</td><td>报告正离开指定高度层。</td><td>LEAVING (level)
正离开（高度层）</td><td>N</td><td>L</td><td>N</td></tr><tr><td>29</td><td>报告正向指定高度层爬升。</td><td>CLIMBING TO (level)
正爬升至（高度层）</td><td>N</td><td>L</td><td>N</td></tr><tr><td>30</td><td>报告正向指定高度层下降。</td><td>DESCENDING TO (level)
正下降至（高度层）</td><td>N</td><td>L</td><td>N</td></tr><tr><td>31</td><td>报告通过指定位置。</td><td>PASSING (position)
通过（位置）</td><td>N</td><td>L</td><td>N</td></tr><tr><td>78</td><td>报告在指定时间，航空器位置如电文所述。</td><td>AT (time) (distance) (to/from)
 position
于（时间）（距离）（距/自）（位置）</td><td>N</td><td>L</td><td>N</td></tr><tr><td>32</td><td>报告现在高度层。</td><td>PRESENT LEVEL (level)
现在高度层（高度层）</td><td>N</td><td>L</td><td>N</td></tr><tr><td>33</td><td>报告现在位置。</td><td>PRESENT POSITION (position)现在位置(位置)</td><td>N</td><td>L</td><td>N</td></tr><tr><td>34</td><td>报告现在速度。</td><td>PRESENT SPEED (speed)现在速度(速度)</td><td>N</td><td>L</td><td>N</td></tr><tr><td>113</td><td>报告请求的速度。</td><td>(speed type) (speed type) (speed type) SPEED (speed)(速度类型)(速度类型)(速度类型)速度(速度)</td><td>N</td><td>L</td><td>N</td></tr><tr><td>35</td><td>报告现在航向度数。</td><td>PRESENT HEADING (degrees)现在航向(度)</td><td>N</td><td>L</td><td>N</td></tr><tr><td>36</td><td>报告现在地面航迹度数。</td><td>PRESENT GROUND TRACK(degrees)现在航迹(度)</td><td>N</td><td>L</td><td>N</td></tr><tr><td>37</td><td>报告航空器现保持指定高度层。</td><td>MAINTAINING (level)保持(高度层)</td><td>N</td><td>L</td><td>N</td></tr><tr><td>72</td><td>(预留)</td><td></td><td>N</td><td>L</td><td>N</td></tr><tr><td>76</td><td>报告航空器已到达指定垂直范围内的高度层。</td><td>REACHING BLOCK (level) TO (level)到达高度段(高度层)至(高度层)</td><td>N</td><td>L</td><td>N</td></tr><tr><td>38</td><td>回诵指配高度层。</td><td>ASSIGNED LEVEL (level)指配高度层(高度层)</td><td>N</td><td>M</td><td>N</td></tr><tr><td>77</td><td>回诵指配垂直范围。</td><td>ASSIGNED BLOCK (level) TO (level)指配高度段(高度层)至(高度层)</td><td>N</td><td>M</td><td>N</td></tr><tr><td>39</td><td>回诵指配速度。</td><td>ASSIGNED SPEED (speed)指配速度(速度)</td><td>N</td><td>M</td><td>N</td></tr><tr><td>40</td><td>回诵指配航路。</td><td>ASSIGNED ROUTE (route clearance)指配航路(航路许可)</td><td>N</td><td>M</td><td>N</td></tr><tr><td>41</td><td>航空器已回到批准航路上。</td><td>BACK ON ROUTE回到航路上</td><td>N</td><td>M</td><td>N</td></tr><tr><td>114</td><td>通知航空器天气晴朗并能够接受回到批准的飞行航路的许可。</td><td>CLEAR OF WEATHER天气晴朗</td><td>N</td><td>M</td><td>N</td></tr><tr><td>42</td><td>指定位置为下一航路点。</td><td>NEXT WAYPOINT (position)下一航路点(位置)</td><td>N</td><td>L</td><td>N</td></tr><tr><td>43</td><td>指定时间为下一航路点的ETA。</td><td>NEXT WAYPOINT ETA (time)下一航路点的ETA(时间)</td><td>N</td><td>L</td><td>N</td></tr><tr><td>44</td><td>指定位置为再下一个航路点。</td><td>ENSUING WAYPOINT (position)再下一个航路点(位置)</td><td>N</td><td>L</td><td>N</td></tr><tr><td>45</td><td>澄清先前报告的飞越航路点。</td><td>REPORTED WAYPOINT (position)已报航路点(位置)</td><td>N</td><td>L</td><td>N</td></tr><tr><td>46</td><td>澄清先前报告的飞越航路点的时间。</td><td>REPORTED WAYPOINT (time)已报航路点(时间)</td><td>N</td><td>L</td><td>N</td></tr><tr><td>47</td><td>已选择指定的 SSR 编码。</td><td>SQUAWKING (code)打开应答机(编码)</td><td>N</td><td>L</td><td>N</td></tr><tr><td>48</td><td>位置报告。</td><td>POSITION REPORT (position report)位置报告(位置报告)</td><td>N</td><td>M</td><td>N</td></tr><tr><td>79</td><td>指定代码为最新收到的 ATIS 的代码。</td><td>ATIS (atis code)ATIS (atis 代码)</td><td>N</td><td>L</td><td>N</td></tr><tr><td>89</td><td>在指定频率上正在监听指定 ATS单位。</td><td>MONITORING (unit name) (frequency)监听(单位名称)(频率)</td><td>U</td><td>M</td><td>N</td></tr><tr><td>102</td><td>用于报告航空器已经降落。</td><td>LANDING REPORT降落报告</td><td>N</td><td>N</td><td>N</td></tr><tr><td>104</td><td>报告预计到达指定地点的时间。</td><td>ETA (position) (time)ETA (地点)(时间)</td><td>L</td><td>L</td><td>N</td></tr><tr><td>105</td><td>报告备降机场。</td><td>ALTERNATE AERODROME (airport)备降机场(机场)</td><td>L</td><td>L</td><td>N</td></tr><tr><td>106</td><td>报告选用高度层</td><td>PREFERRED LEVEL (level)选用高度层(高度层)</td><td>L</td><td>L</td><td>N</td></tr><tr><td>109</td><td>报告计划开始下降进近的时间。</td><td>TOP OF DESCENT (time)下降起始点(时间)</td><td>L</td><td>L</td><td>N</td></tr><tr><td>110</td><td>报告计划开始下降进近的位置</td><td>TOP OF DESCENT (position)下降起始点(位置)</td><td>L</td><td>L</td><td>N</td></tr><tr><td>111</td><td>报告计划开始下降进近的选用的位置和时间。</td><td>TOP OF DESCENT (time) (position)下降起始点(时间)(位置)</td><td>L</td><td>L</td><td>N</td></tr></table>

注：只要指定了不同的“高度层”，电文即可以指定一个单一的高度层或者一个垂直范围，即高度段。

表 A5-21 询问请求 (下行)  

<table><tr><td></td><td>电文目的/用途</td><td>电文规定格式</td><td>紧急</td><td>告警</td><td>回答</td></tr><tr><td>49</td><td>请示可以取得指定速度许可的最早时间。</td><td>WHEN CAN WE EXPECT (speed)我们何时可以期望(速度)</td><td>L</td><td>L</td><td>Y</td></tr><tr><td>50</td><td>请示可以取得指定速度范围许可的最早时间。</td><td>WHEN CAN WE EXPECT (speed) TO (speed)我们何时可以期望(速度)至(速度)</td><td>L</td><td>L</td><td>Y</td></tr><tr><td>51</td><td>请示可以取得回到计划航路许可的最早时间。</td><td>WHEN CAN WE EXPECT BACK ON ROUTE我们何时可以期望回到航路上</td><td>L</td><td>L</td><td>Y</td></tr><tr><td>52</td><td>请示可以取得下降许可的最早时间。</td><td>WHEN CAN WE EXPECT LOWER LEVEL我们何时可以期望在更低高度层飞行</td><td>L</td><td>L</td><td>Y</td></tr><tr><td>53</td><td>请示可以取得爬升许可的最早时间。</td><td>WHEN CAN WE EXPECT HIGHER LEVEL
我们何时可以期望在更高高度层飞行</td><td>L</td><td>L</td><td>Y</td></tr><tr><td>54</td><td>请示可以取得巡航爬升至指定高度层许可的最早时间。</td><td>WHEN CAN WE EXPECT CRUISE CLIMB TO (level)
我们何时可以期望巡航爬升至(高度层)</td><td>L</td><td>L</td><td>Y</td></tr><tr><td>87</td><td>请示可以取得爬升至指定高度层许可的最早时间。</td><td>WHEN CAN WE EXPECT CLIMB TO (level)
我们何时可以期望爬升至(高度层)</td><td>L</td><td>L</td><td>Y</td></tr><tr><td>88</td><td>请示可以取得下降至指定高度层许可的最早时间。</td><td>WHEN CAN WE EXPECT DESCENT TO (level)
我们何时可以期望下降至(高度层)</td><td>L</td><td>L</td><td>Y</td></tr></table>

注：只要指定了不同的“高度层”，电文即可以指定一个单一的高度层或者一个垂直范围，即高度段。

表 A5-22 紧急电文 (下行)  

<table><tr><td></td><td>电文目的/用途</td><td>电文规定格式</td><td>紧急</td><td>告警</td><td>回答</td></tr><tr><td>55</td><td>紧急电文前缀。</td><td>PAN PAN PAN</td><td>U</td><td>H</td><td>Y</td></tr><tr><td>56</td><td>遇险电文前缀。</td><td>MAYDAY MAYDAY MAYDAY</td><td>D</td><td>H</td><td>Y</td></tr><tr><td>112</td><td>专门表示航空器遭遇非法干扰。</td><td>SQUAWKING 7500
应答编码 7500</td><td>U</td><td>H</td><td>N</td></tr><tr><td>57</td><td>通知剩余油量和机上人数。</td><td>(remaining fuel) OF FUEL
REMAINING AND (persons on board) PERSONS ON BOARD
剩余的油量(剩余油量)和机上人数
(机上人数)</td><td>U</td><td>H</td><td>Y</td></tr><tr><td>58</td><td>报告飞行员希望取消紧急状况。</td><td>CANCEL EMERGENCY
取消紧急状况</td><td>U</td><td>M</td><td>Y</td></tr><tr><td>59</td><td>报告因紧急需要,航空器经由指定航路改航至指定地点。</td><td>DIVERTING TO (position) VIA (route clearance)
改航至(地点)经由(批准航路)</td><td>U</td><td>H</td><td>Y</td></tr><tr><td>60</td><td>报告因紧急需要,航空器在批准航路指定方向偏离至指定距离,保持平行航迹。</td><td>OFFSETTING (specified distance)
(direction) OF ROUTE
偏离航路的(方向)(指定距离)</td><td>U</td><td>H</td><td>Y</td></tr><tr><td>61</td><td>报告因紧急需要,航空器正下降到指定高度层。</td><td>DESCENDING TO (level)
下降到(高度层)</td><td>U</td><td>H</td><td>Y</td></tr><tr><td>80</td><td>通知因紧急需要,航空器在批准航路指定方向偏航至指定距离。</td><td>DEVIATING UP TO (specified distance) (direction) OF ROUTE
偏航至航路的(方向)(指定距离)</td><td>U</td><td>H</td><td>Y</td></tr></table>

注：只要指定了不同的“高度层”，电文即可以指定一个单一的高度层或者一个垂直范围，即高度段。

表 A5-23 系统管理电文 (下行)  

<table><tr><td></td><td>电文目的/用途</td><td>电文规定格式</td><td>紧急</td><td>告警</td><td>回答</td></tr><tr><td>62</td><td>系统电文——航空电子设备检测发现错误。</td><td>ERROR (error information)错误(错误信息)</td><td>U</td><td>L</td><td>N</td></tr><tr><td>63</td><td>系统电文——拒收非当前数据负责单位的地面站发来的CPDLC电文。</td><td>NOT CURRENT DATA AUTHORITY非当前数据负责单位</td><td>L</td><td>L</td><td>N</td></tr><tr><td>99</td><td>系统电文——通知地面站,现在它是当前数据负责单位。</td><td>CURRENT DATA AUTHORITY当前数据负责单位</td><td>L</td><td>L</td><td>N</td></tr><tr><td>64</td><td>通知地面站指定的ATSU是当前数据负责单位。</td><td>(facility designation)(负责单位代号)</td><td>L</td><td>L</td><td>N</td></tr><tr><td>107</td><td>系统电文——通知地面系统,在当前数据负责单位未指定地面系统为NDA时,试图联系一架航空器。</td><td>NOT AUTHORIZATION NEXT DATA AUTHORITY无批准的下一数据负责单位</td><td>L</td><td>L</td><td>N</td></tr><tr><td>73</td><td>系统电文——表明软件版号。</td><td>(version number)(版号)</td><td>L</td><td>L</td><td>N</td></tr><tr><td>100</td><td>向地面系统证实,航空器系统收到逻辑认收电文,并认为可接受及向负责人展示。</td><td>LOGICAL ACKNOWLEDGEMENT逻辑认收</td><td>N</td><td>M</td><td>N</td></tr></table>

表 A5-24. 间距信息 (下行链路)  

<table><tr><td>编号</td><td>电文目的/用途</td><td>电文规定格式</td><td>紧急</td><td>告警</td><td>回答</td></tr><tr><td>*</td><td>咨询表示驾驶员有高度层更换程序设备,并提供距参照航空器的距离,包括航空器识别。此电文总是连接一个垂直请求。</td><td>ITP (distance) BEHIND (aircraft identification of reference aircraft) (参照航空器的航空器识别代码)后方有高度层更换程序(距离)</td><td>N</td><td>L</td><td>N</td></tr><tr><td>*</td><td>咨询表示驾驶员有高度层更换程序设备,并提供距参照航空器的距离,包括航空器识别。此电文总是连接一个垂直请求。</td><td>ITP (distance) AHEAD OF (aircraft identification of reference aircraft) (参照航空器的航空器识别代码)前方有高度层更换程序(距离)</td><td>N</td><td>L</td><td>N</td></tr><tr><td>*</td><td>咨询表示驾驶员有高度层更换程序设备,并提供距两架参照航空器的距离,包括航空器识别。此电文总是连接一个垂直请求。</td><td>ITP (distance) BEHIND (aircraft identification of reference aircraft) AND (distance) BEHIND (aircraft identification of reference aircraft) (参照航空器的航空器识别代码)后方(距离)和(参照航空器的航空器识别代码)后方有高度层更换程序(距离)</td><td>N</td><td>L</td><td>N</td></tr></table>

表 A5-25 其他电文 (下行)  

<table><tr><td>编号</td><td>电文目的/用途</td><td>电文规定格式</td><td>紧急</td><td>告警</td><td>回答</td></tr><tr><td>*</td><td>咨询表示驾驶员有高度层更换程序设备，并提供距两架参照航空器的距离，包括航空器识别。此电文总是连接一个垂直请求。</td><td>ITP (distance) AHEAD OF (aircraft identification of reference aircraft) AND (distance) AHEAD OF (aircraft identification of reference aircraft) (参照航空器的航空器识别代码)前方(距离)和(参照航空器的航空器识别代码)前方有高度层更换程序(距离)</td><td>N</td><td>L</td><td>N</td></tr><tr><td>*</td><td>咨询表示驾驶员有高度层更换程序设备，并提供距一架参照航空器的距离和距另一架参照航空器的距离，包括航空器识别。此电文总是连接一个垂直请求。</td><td>ITP (distance) BEHIND (aircraft identification of reference aircraft) AND (distance) AHEAD OF (aircraft identification of reference aircraft) (参照航空器的航空器识别代码)后方(距离)和(参照航空器的航空器识别代码)前方有高度层更换程序(距离)</td><td>N</td><td>L</td><td>N</td></tr><tr><td colspan="6">*使用DM67按照自由格式发送这些电文。</td></tr></table>

<table><tr><td></td><td>电文目的/用途</td><td>电文规定格式</td><td>紧急</td><td>告警</td><td>回答</td></tr><tr><td>65</td><td>用于解释飞行员电文的理由。</td><td>DUE TO WEATHER
因为天气</td><td>L</td><td>L</td><td>N</td></tr><tr><td>66</td><td>用于解释飞行员电文的理由。</td><td>DUE TO AIRCRAFT PERFORMANCE
因为航空器性能</td><td>L</td><td>L</td><td>N</td></tr><tr><td>74</td><td>说明飞行员希望自行保持间隔，并保持 VMC。</td><td>REQUEST TO MAINTAIN OWN
SEPARATION AND VMC
请求自行保持间隔和 VMC</td><td>L</td><td>L</td><td>Y</td></tr><tr><td>75</td><td>和其他电文连用，表示飞行员希望在做好准备时，执行提出的请求。</td><td>AT PILOTSDISCRETION
由飞行员决定</td><td>L</td><td>L</td><td>N</td></tr><tr><td>101</td><td>允许飞行员表示希望终止当前数据负责单位的 CPDLC 服务。</td><td>REQUEST END OF SERVICE
请求终止服务</td><td>L</td><td>L</td><td>Y</td></tr><tr><td>103</td><td>允许飞行员表明已取消 IFR 飞行计划。</td><td>CANCELLING IFR
取消 IFR</td><td>N</td><td>L</td><td>Y</td></tr><tr><td>108</td><td>通知除冰工作结束。</td><td>DE-ICING COMPLETE
除冰结束</td><td>L</td><td>L</td><td>N</td></tr><tr><td>67</td><td></td><td>(free text)
(非规定格式电文)</td><td>N</td><td>L</td><td>N</td></tr><tr><td>68</td><td></td><td>(free text)
(非规定格式电文)</td><td>D</td><td>H</td><td>Y</td></tr><tr><td>90</td><td></td><td>(free text)(非规定格式电文)</td><td>N</td><td>M</td><td>N</td></tr><tr><td>91</td><td></td><td>(free text)(非规定格式电文)</td><td>N</td><td>L</td><td>Y</td></tr><tr><td>92</td><td></td><td>(free text)(非规定格式电文)</td><td>L</td><td>L</td><td>Y</td></tr><tr><td>93</td><td></td><td>(free text)(非规定格式电文)</td><td>U</td><td>H</td><td>N</td></tr><tr><td>94</td><td></td><td>(free text)(非规定格式电文)</td><td>D</td><td>H</td><td>N</td></tr><tr><td>95</td><td></td><td>(free text)(非规定格式电文)</td><td>U</td><td>M</td><td>N</td></tr><tr><td>96</td><td></td><td>(free text)(非规定格式电文)</td><td>U</td><td>L</td><td>N</td></tr><tr><td>97</td><td></td><td>(free text)(非规定格式电文)</td><td>L</td><td>L</td><td>N</td></tr><tr><td>98</td><td></td><td>(free text)(非规定格式电文)</td><td>N</td><td>N</td><td>N</td></tr></table>

注：非固定格式电文不与电文的目的相联系。应用已在电文集中使用的任何属性组合来发送非固定格式电文的能力，已在航空电信网 (ATN) 的技术要求中规定 (附件 10 第三卷，第一部分，第三章)。

表 A5-26 询问回答 (下行)  

<table><tr><td></td><td>电文目的/用途</td><td>电文规定格式</td><td>紧急</td><td>告警</td><td>回答</td></tr><tr><td>81</td><td>我们可以在指定时间接受指定高度层。</td><td>WE CAN ACCEPT (level) AT (time)我们可以在(时间)接受(高度层)</td><td>L</td><td>L</td><td>N</td></tr><tr><td>115</td><td>我们可以在指定位置接受指定高度。</td><td>WE CAN ACCEPT (level) AT (position)我们能在(位置)接受(高度)</td><td>L</td><td>L</td><td>N</td></tr><tr><td>82</td><td>我们不能接受指定高度层。</td><td>WE CANNOT ACCEPT (level)我们不能接受(高度层)</td><td>L</td><td>L</td><td>N</td></tr><tr><td>83</td><td>我们能在指定时间接受指定速度。</td><td>WE CAN ACCEPT (speed) AT (time)我们能在(时间)接受(速度)</td><td>L</td><td>L</td><td>N</td></tr><tr><td>116</td><td>我们能在指定位置接受指定速度。</td><td>WE CAN ACCEPT (speed) AT (position)我们能在(位置)接受(速度)</td><td>L</td><td>L</td><td>N</td></tr><tr><td>84</td><td>我们不能接受指定速度。</td><td>WE CANNOT ACCEPT (speed)我们不能接受(速度)</td><td>L</td><td>L</td><td>N</td></tr><tr><td>85</td><td>我们能在指定时间接受偏于指定方向、指定距离的平行航迹。</td><td>WE CAN ACCEPT (specified distance) (direction) AT (time)我们能于(时间)接受(方向)(指定距离)</td><td>L</td><td>L</td><td>N</td></tr><tr><td>117</td><td>我们能在指定位置接受偏于指定方向、指定距离的平行航迹。</td><td>WE CAN ACCEPT (specified distance) (direction) AT (position)我们能在(位置)接受(指定距离)(方向)</td><td>L</td><td>L</td><td>N</td></tr><tr><td>86</td><td>我们不能接受偏于指定方向、指定距离的平行航迹。</td><td>WE CANNOT ACCEPT (specified distance) (direction)我们不能接受(方向)(指定距离)</td><td>L</td><td>L</td><td>N</td></tr></table>

注：只要指定了不同的“高度层”，电文即可以指定一个单一的高度层或者一个垂直范围，即高度段。